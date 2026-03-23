import http from "node:http";
import { URL } from "node:url";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Readable } from "node:stream";
import { type ReadableStream } from "node:stream/web";

import { Credentials } from "@/shared/types";

const getParamFromUrlRequest = (
  param: string,
  request: http.IncomingMessage,
) => {
  const url = new URL(request.url as string, `http://${request.headers.host}`);

  return url.searchParams.get(param);
};

const responseJson = (
  response: http.ServerResponse<http.IncomingMessage>,
  statusCode: number,
  data: string | { error: string },
) => {
  response.writeHead(statusCode, {
    "content-type": "application/json",
  });

  response.end(JSON.stringify(data));
  return;
};

const buildUrl = (credentials: Credentials, streamId: number) => {
  const { server, username, password } = credentials;

  return `http://${server}/series/${username}/${password}/${streamId}.mkv`;
};

const getTempPath = (streamId: number | undefined) => {
  if (!streamId) return "";
  return path.join(os.tmpdir(), `stream_${streamId}.mkv`);
};

const fetchStream = async (
  streamUrl: string,
  headers: Record<string, string>,
  attempts = 3,
) => {
  console.log("headers PARAM", headers);
  const responseStream = await fetch(streamUrl, {
    headers,
  });

  if (responseStream.status === 401) {
    console.log("401");
    if (attempts > 0) {
      console.log("Retrying...");
      return fetchStream(streamUrl, headers, attempts - 1);
    } else {
      throw new Error("Max retries exceeded");
    }
  }

  if (!responseStream.ok) {
    throw new Error(`HTTP error! status: ${responseStream.status}`);
  }

  return responseStream;
};

const map = new Map();
const mapStreamId = new Map<"streamId", number>();

const handleRequest = async (
  request: http.IncomingMessage,
  response: http.ServerResponse<http.IncomingMessage>,
  playlistCredential: Credentials,
) => {
  try {
    const streamId = Number(getParamFromUrlRequest("streamId", request));

    console.log("Stream ID:", streamId);

    if (!mapStreamId.has("streamId")) {
      mapStreamId.set("streamId", streamId);
    }

    if (!streamId) {
      return responseJson(response, 400, { error: "Stream ID is required" });
    }

    const requestRange: string | undefined = request.headers.range;

    if (!requestRange) {
      return responseJson(response, 400, {
        error: "The 'Range' header is required",
      });
    }

    const tempPath = getTempPath(streamId);

    if (fs.existsSync(tempPath)) {
      const fileStats = fs.statSync(tempPath);
      const fileSize = map.has("fileSize")
        ? Number(map.get("fileSize"))
        : fileStats.size;

      const arrayRange = requestRange.replace("bytes=", "").split("-");
      const start = Number(arrayRange[0]);
      const end = arrayRange[1] ? Number(arrayRange[1]) : fileSize - 1;

      const chunk = 10 ** 6;
      const finalEnd = Math.min(end, start + chunk);
      const contentLength = finalEnd - start + 1;

      const range = `bytes ${start}-${finalEnd}/${fileSize}`;
      console.log(`Serving range: ${range}`);

      response.writeHead(206, {
        "content-range": range,
        "content-length": contentLength,
        "content-type": "video/x-matroska",
        "accept-ranges": `0-${fileSize}`,
      });

      const videoStreamReadable = fs.createReadStream(tempPath);
      videoStreamReadable.pipe(response);
    }

    const streamUrl = buildUrl(playlistCredential, streamId);

    const arrayRange = requestRange.replace("bytes=", "").split("-");

    const contentLength = map.has(`content-length-${streamId}`)
      ? Number(map.get(`content-length-${streamId}`))
      : await fetchStream(streamUrl, {
          Range: `bytes=0-0`,
        }).then((res) => {
          const data = Number(res.headers.get("accept-ranges")?.split("-")[1]);
          console.log("set content length on map", data);
          map.set(`content-length-${streamId}`, data);
          return data;
        });

    const start = Number(arrayRange[0]);
    const end = arrayRange[1] ? Number(arrayRange[1]) : contentLength - 1;

    const chunk = 15 ** 6;
    const finalEnd = Math.min(end, start + chunk);

    const range = `bytes=${start}-${finalEnd}`;

    const responseStream = await fetchStream(streamUrl, {
      Range: range,
    });

    const headers: Record<string, string> = {};
    const ct = responseStream.headers.get("content-type");
    if (ct) headers["content-type"] = ct;
    const cl = responseStream.headers.get("content-length");
    if (cl) headers["content-length"] = cl;
    const conn = responseStream.headers.get("connection");
    if (conn) headers["connection"] = conn;
    const ar = responseStream.headers.get("accept-ranges");
    if (ar) headers["accept-ranges"] = ar;
    const cr = responseStream.headers.get("content-range");
    if (cr) headers["content-range"] = cr;

    response.writeHead(206, headers);

    Readable.fromWeb(responseStream.body! as ReadableStream).pipe(response);
  } catch (error) {
    console.error("error", error);
    response.writeHead(500);
    response.end();
    process.exit(1);
  }
};

process.on("exit", () => {
  console.log("Process exited");
  if (!mapStreamId.has("streamId")) return;

  const streamId = mapStreamId.get("streamId");
  const tempPath = getTempPath(streamId);

  if (tempPath && fs.existsSync(tempPath)) {
    fs.existsSync(tempPath);
  }

  mapStreamId.delete("streamId");
});

process.on("SIGINT", () => {
  console.log("Received SIGINT signal");
  process.exit();
});

process.on("disconnect", () => {
  console.log("Parent disconnected, shutting down child...");
  process.exit();
});

process.on("message", (playlistCredential: Credentials) => {
  console.log("Received from parent:", playlistCredential);

  if (process.send) {
    process.send(`PID ${process.pid}`);
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response, playlistCredential).catch((err) => {
      console.error(err);
      if (!response.writableEnded) {
        response.writeHead(500, "Internal Server Error");
      }
    });
  });

  server.on("error", (error) => {
    console.error(error);
  });

  server.listen(9876, "127.0.0.1", () => {
    console.log(`Server created and running`);
  });
});
