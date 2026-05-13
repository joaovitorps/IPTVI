import { Credentials } from "@/shared/types";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "@ffprobe-installer/ffprobe";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { URL } from "node:url";

import { buildFfmpegArgs } from "./ffmpeg-builder";
import { probeStream, resolveRedirect } from "./ffprobe-prober";

const HOST = "127.0.0.1";
const PORT = 9876;
const HLS_BASE_DIR = path.join(tmpdir(), "hls");
const SEGMENT_TIMEOUT = 60000;

const MIME_TYPES: Record<string, string> = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
  ".aac": "audio/aac",
  ".vtt": "text/vtt",
};

let server: http.Server | null = null;
let ffmpeg: ChildProcessWithoutNullStreams | null = null;
let hlsDir = "";
let shutdownInProgress = false;

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
};

const buildUrl = (credentials: Credentials, streamId: string): string => {
  return `http://${credentials.server}/series/${credentials.username}/${credentials.password}/${streamId}.mkv`;
};

const ensureDir = (dir: string): void => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const waitForFirstSegment = async (dir: string): Promise<void> => {
  const deadline = Date.now() + SEGMENT_TIMEOUT;
  return new Promise<void>((resolve, reject) => {
    const poll = (): void => {
      if (shutdownInProgress) {
        reject(new Error("Shutdown during segment wait"));
        return;
      }
      try {
        const files = readdirSync(dir);
        if (files.some((f) => f.endsWith(".ts"))) {
          resolve();
          return;
        }
      } catch {
        // directory may not exist yet
      }
      if (Date.now() >= deadline) {
        reject(new Error("Timeout waiting for first HLS segment"));
        return;
      }
      setTimeout(poll, 500);
    };
    poll();
  });
};

export const hlsRequestHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  hlsDirectory = hlsDir,
): void => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || HOST}`);
    let requestedPath = path.normalize(url.pathname).replace(/^\/+/, "");
    const hlsPrefixMatch = requestedPath.match(/^hls\/[^/]+\/(.+)/);
    if (hlsPrefixMatch) requestedPath = hlsPrefixMatch[1];
    const filePath = path.join(hlsDirectory, requestedPath);

    if (!filePath.startsWith(hlsDirectory)) {
      response.writeHead(403, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      });
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      response.writeHead(404, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      });
      response.end("Not found");
      return;
    }

    const mimeType = getMimeType(filePath);
    const fileSize = statSync(filePath).size;
    const range = request.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      response.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      });

      const stream = createReadStream(filePath, { start, end });
      stream.pipe(response);
    } else {
      response.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      });

      const stream = createReadStream(filePath);
      stream.pipe(response);
    }
  } catch (error) {
    console.error("[hls] request handler error:", error);
    if (!response.writableEnded) {
      response.writeHead(500, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      });
      response.end("Internal server error");
    }
  }
};

const shutdown = (): void => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  if (ffmpeg && !ffmpeg.killed) {
    try {
      ffmpeg.kill("SIGTERM");
    } catch {
      // process may already be dead
    }
  }

  if (server) {
    try {
      server.close();
    } catch {
      // server may already be closed
    }
  }

  if (hlsDir && existsSync(hlsDir)) {
    try {
      rmSync(hlsDir, { recursive: true, force: true });
    } catch {
      // directory may be in use or already deleted
    }
  }

  process.exit(0);
};

async function startHlsServer(
  credentials: Credentials,
  playlistId: string,
  streamId: string,
): Promise<void> {
  hlsDir = path.join(HLS_BASE_DIR, playlistId);
  ensureDir(hlsDir);

  const upstreamUrl = buildUrl(credentials, streamId);
  const ffprobePath = ffprobe.path;

  console.log("[hls] resolving redirect for:", upstreamUrl);
  const resolvedUrl = await resolveRedirect(upstreamUrl);
  console.log("[hls] resolved to:", resolvedUrl);

  console.log("[hls] probing tracks from:", resolvedUrl);
  const probeResult = await probeStream(ffprobePath, resolvedUrl);
  console.log(`[hls] found ${probeResult.streams.length} stream(s)`);

  const { args, tracks } = buildFfmpegArgs(probeResult, resolvedUrl, hlsDir);
  console.log("[hls] ffmpeg args:", args.join(" "));

  const ffmpegBinary = ffmpegPath as string;
  ffmpeg = spawn(ffmpegBinary, args);

  ffmpeg.stderr.on("data", (data: Buffer) => {
    process.stderr.write(`[ffmpeg] ${data.toString()}`);
  });

  ffmpeg.on("exit", (code, signal) => {
    console.log(`[hls] ffmpeg exited (code=${code}, signal=${signal})`);
    ffmpeg = null;
    if (!shutdownInProgress) {
      if (process.send) {
        process.send({
          type: "error",
          message: `ffmpeg exited unexpectedly (code=${code}, signal=${signal})`,
        });
      }
      shutdown();
    }
  });

  ffmpeg.on("error", (err) => {
    console.error("[hls] ffmpeg spawn error:", err);
    if (!shutdownInProgress) {
      if (process.send) {
        process.send({
          type: "error",
          message: `ffmpeg spawn error: ${err.message}`,
        });
      }
      shutdown();
    }
  });

  console.log("[hls] waiting for first segment...");
  await waitForFirstSegment(hlsDir);
  console.log("[hls] first segment ready");

  server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      });
      res.end();
      return;
    }
    hlsRequestHandler(req, res);
  });

  server.on("error", (err) => {
    console.error("[hls] server error:", err);
  });

  await new Promise<void>((resolve) => {
    server.listen(PORT, HOST, () => {
      console.log(`[hls] HTTP server running on ${HOST}:${PORT}`);
      resolve();
    });
  });

  if (process.send) {
    process.send({
      type: "ready",
      pid: process.pid,
      hlsPlaylist: `/hls/${playlistId}/master.m3u8`,
      tracks,
    });
  }
}

  if (!process.env.VITEST) {
  process.on("exit", () => {
    if (ffmpeg && !ffmpeg.killed) {
      try {
        ffmpeg.kill("SIGTERM");
      } catch {
        // process may already be dead
      }
    }
    if (hlsDir && existsSync(hlsDir)) {
      try {
        rmSync(hlsDir, { recursive: true, force: true });
      } catch {
        // directory may be in use or already deleted
      }
    }
  });

  process.on("SIGINT", () => shutdown());
  process.on("SIGTERM", () => shutdown());
  process.on("disconnect", () => shutdown());

  process.on("uncaughtException", (err) => {
    console.error("[hls] uncaught exception:", err);
    shutdown();
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[hls] unhandled rejection:", reason);
    shutdown();
  });
}

process.on("message", (msg: unknown) => {
  const message = msg as Record<string, unknown>;

  if (message.type === "shutdown") {
    shutdown();
    return;
  }

  if (message.type === "credentials") {
    const { playlistId, streamId, server: srv, username, password } = message as Record<string, string>;
    const credentials: Credentials = { server: srv, username, password };

    startHlsServer(credentials, playlistId, streamId).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[hls] startup error:", message);
      if (process.send) {
        process.send({ type: "error", message });
      }
      shutdown();
    });
  }
});
