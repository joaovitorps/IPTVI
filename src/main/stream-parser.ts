import { Credentials } from "@/shared/types";
import * as fs from "node:fs";
import http from "node:http";
import * as os from "node:os";
import * as path from "node:path";
import { Readable } from "node:stream";
import { type ReadableStream } from "node:stream/web";
import { URL } from "node:url";

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
  console.log("url", streamUrl);
  headers = {
    Accept: "*/*",
    ...headers,
  };
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

const map = new Map<string, number>();
const mapStreamId = new Map<"streamId", number>();

let server: http.Server | null = null;
let shutdownInProgress = false;

const cleanupTempFiles = (streamId?: number) => {
  const tempPath = getTempPath(streamId);
  if (tempPath && fs.existsSync(tempPath)) {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // file may already be in use
    }
  }
};

const clearCaches = () => {
  map.clear();
  mapStreamId.clear();
};

const shutdown = () => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  if (startupTimer) {
    clearTimeout(startupTimer);
    startupTimer = null;
  }

  if (server) {
    server.close();
    server = null;
  }

  clearCaches();
  cleanupTempFiles(mapStreamId.get("streamId"));

  process.exit(0);
};

let startupTimer: ReturnType<typeof setTimeout> | null = null;

const requestHandler = async (
  request: http.IncomingMessage,
  response: http.ServerResponse<http.IncomingMessage>,
  playlistCredential: Credentials,
) => {
  try {
    const streamId = Number(getParamFromUrlRequest("streamId", request));

    if (!mapStreamId.has("streamId")) {
      mapStreamId.set("streamId", streamId);
    }

    if (!streamId) {
      return responseJson(response, 400, { error: "Stream ID is required" });
    }

    const clientHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.headers)) {
      if (value && typeof value === "string") {
        clientHeaders[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        clientHeaders[key] = value[0];
      }
    }
    delete clientHeaders.host;
    delete clientHeaders.connection;

    const requestRange = request.headers.range || "bytes=0-";

    const tempPath = getTempPath(streamId);

    if (fs.existsSync(tempPath)) {
      const fileStats = fs.statSync(tempPath);
      const fileSize = map.has(`content-length-${streamId}`)
        ? (map.get(`content-length-${streamId}`) as number)
        : fileStats.size;

      const arrayRange = requestRange.replace("bytes=", "").split("-");
      const start = Number(arrayRange[0]);
      const end = arrayRange[1] ? Number(arrayRange[1]) : fileSize - 1;

      const chunk = 1024 * 1024;
      const finalEnd = Math.min(end, start + chunk);
      const contentLength = finalEnd - start + 1;

      const rangeHeader = `bytes ${start}-${finalEnd}/${fileSize}`;

      response.writeHead(206, {
        "content-range": rangeHeader,
        "content-length": contentLength,
        "content-type": "video/x-matroska",
        "accept-ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      });

      const videoStreamReadable = fs.createReadStream(tempPath, {
        start,
        end: finalEnd,
      });
      videoStreamReadable.pipe(response);
      return;
    }

    const streamUrl = buildUrl(playlistCredential, streamId);

    let totalLength = map.get(`content-length-${streamId}`) as
      | number
      | undefined;
    if (totalLength === undefined) {
      const headRes = await fetchStream(streamUrl, {
        Range: "bytes=0-0",
      });

      const contentRange = headRes.headers.get("content-range");
      if (contentRange) {
        totalLength = Number(contentRange.split("/")[1]);
      } else {
        totalLength = Number(headRes.headers.get("content-length"));
      }

      if (totalLength) {
        map.set(`content-length-${streamId}`, totalLength);
      }
    }

    const arrayRange = requestRange.replace("bytes=", "").split("-");
    const start = Number(arrayRange[0]);
    const end = arrayRange[1] ? Number(arrayRange[1]) : (totalLength || 1) - 1;

    const chunk = 5 * 1024 * 1024;
    const finalEnd = totalLength ? Math.min(end, start + chunk) : end;

    const range = `bytes=${start}-${finalEnd}`;

    const responseStream = await fetchStream(streamUrl, {
      Range: range,
    });

    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "accept-ranges": "bytes",
    };

    const ct = responseStream.headers.get("content-type");
    if (ct) headers["content-type"] = ct;

    const cl = responseStream.headers.get("content-length");
    if (cl) headers["content-length"] = cl;

    const cr = responseStream.headers.get("content-range");
    if (cr) headers["content-range"] = cr;

    response.writeHead(responseStream.status, headers);

    if (responseStream.body) {
      Readable.fromWeb(responseStream.body as ReadableStream).pipe(response);
    } else {
      response.end();
    }
  } catch (error) {
    console.error("Proxy Request Error:", error);
    if (!response.writableEnded) {
      response.writeHead(500);
      response.end();
    }
  }
};

const startServer = (playlistCredential: Credentials) => {
  server = http.createServer((request, response) => {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      });
      response.end();
      return;
    }

    requestHandler(request, response, playlistCredential).catch((err) => {
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
    console.log("Server created and running");
  });
};

process.on("exit", () => {
  cleanupTempFiles(mapStreamId.get("streamId"));
});

process.on("SIGINT", () => {
  shutdown();
});

process.on("SIGTERM", () => {
  shutdown();
});

process.on("disconnect", () => {
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  shutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  shutdown();
});

process.on("message", (msg: unknown) => {
  const message = msg as Record<string, unknown>;

  if (message.type === "shutdown") {
    shutdown();
    return;
  }

  if (message.type === "credentials") {
    const { server: srv, username, password } = message as unknown as Credentials;
    const credentials: Credentials = { server: srv, username, password };

    if (process.send) {
      process.send(`PID ${process.pid}`);
    }

    startServer(credentials);
    return;
  }
});
