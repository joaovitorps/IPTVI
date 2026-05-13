import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Writable } from "node:stream";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { hlsRequestHandler } from "@/main/stream-parser";

interface MockResponse extends ServerResponse {
  _chunks: Buffer[];
  _finishPromise: Promise<void>;
  headers: Record<string, string | number>;
}

function createMockResponse(): MockResponse {
  const chunks: Buffer[] = [];

  let resolveFinish: (() => void) | null = null;
  const finishPromise = new Promise<void>((resolve) => {
    resolveFinish = resolve;
  });

  const writable = new Writable({
    write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
    final() {
      if (resolveFinish) resolveFinish();
    },
  });

  const res = Object.assign(writable, {
    statusCode: 200,
    _chunks: chunks,
    _finishPromise: finishPromise,
    headers: {} as Record<string, string | number>,
    end: function (this: Writable & { _chunks: Buffer[] }, data?: unknown) {
      if (data) {
        this._chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data as string));
      }
      Writable.prototype.end.call(this);
    },
    writeHead: function (
      this: { statusCode: number; headers: Record<string, string | number> },
      code: number,
      hdrs: Record<string, string | number>,
    ) {
      this.statusCode = code;
      for (const [key, val] of Object.entries(hdrs)) {
        this.headers[key] = val;
      }
    },
  });

  return res as unknown as MockResponse;
}

function createMockRequest(url: string, headers: Record<string, string> = {}): IncomingMessage {
  return {
    url,
    headers: { host: "127.0.0.1", ...headers },
    method: "GET",
    socket: {},
    statusCode: 200,
    statusMessage: "OK",
  } as IncomingMessage;
}

describe("HlsRequestHandler", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `hls-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should serve an existing file", async () => {
    writeFileSync(join(testDir, "master.m3u8"), "#EXTM3U\n#EXT-X-VERSION:3\n");
    const req = createMockRequest("/master.m3u8");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("application/vnd.apple.mpegurl");
    expect(Buffer.concat(res._chunks).length).toBeGreaterThan(0);
  });

  it("should serve ts segments with correct mime type", async () => {
    writeFileSync(join(testDir, "stream_0_0.ts"), Buffer.alloc(100));
    const req = createMockRequest("/stream_0_0.ts");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("video/mp2t");
  });

  it("should serve aac segments with correct mime type", async () => {
    writeFileSync(join(testDir, "stream_2_0.aac"), Buffer.alloc(50));
    const req = createMockRequest("/stream_2_0.aac");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("audio/aac");
  });

  it("should serve vtt subtitles with correct mime type", async () => {
    writeFileSync(join(testDir, "stream_4_0.vtt"), "WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello\n");
    const req = createMockRequest("/stream_4_0.vtt");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/vtt");
  });

  it("should return 404 for non-existing files", () => {
    const req = createMockRequest("/nonexistent.m3u8");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);

    expect(res.statusCode).toBe(404);
  });

  it("should serve nested path files", async () => {
    const nestedDir = join(testDir, "subdir");
    mkdirSync(nestedDir, { recursive: true });
    writeFileSync(join(nestedDir, "test.m3u8"), "#EXTM3U\n");
    const req = createMockRequest("/subdir/test.m3u8");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(200);
  });

  it("should support range requests", async () => {
    writeFileSync(join(testDir, "test.ts"), Buffer.alloc(1000));
    const req = createMockRequest("/test.ts", { range: "bytes=0-499" });
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.statusCode).toBe(206);
    expect(res.headers["Content-Range"]).toBeDefined();
    expect(res.headers["Content-Range"]).toContain("bytes 0-499/1000");
    expect(res.headers["Accept-Ranges"]).toBe("bytes");
  });

  it("should include CORS headers", async () => {
    writeFileSync(join(testDir, "test.m3u8"), "#EXTM3U\n");
    const req = createMockRequest("/test.m3u8");
    const res = createMockResponse();

    hlsRequestHandler(req, res, testDir);
    await res._finishPromise;

    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("should handle errors gracefully", () => {
    const req = createMockRequest("/master.m3u8");
    const res = createMockResponse();

    hlsRequestHandler(req, res, "/tmp/nonexistent-hls-dir-12345");

    expect(res.statusCode).toBe(404);
  });
});
