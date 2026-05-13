/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { ExecFileCallback } from "node:child_process";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExecFile = vi.fn();
vi.mock("node:child_process", () => ({
  execFile: mockExecFile,
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { probeStream, FFprobeError } = await import("@/main/ffprobe-prober");

describe("FFprobeProber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ url: "http://example.com/video.mkv" });
  });

  const validProbeOutput = JSON.stringify({
    streams: [
      {
        index: 0,
        codec_type: "video",
        codec_name: "h264",
        width: 1920,
        height: 1080,
      },
      {
        index: 1,
        codec_type: "audio",
        codec_name: "aac",
        tags: { language: "eng", title: "English" },
      },
      {
        index: 2,
        codec_type: "audio",
        codec_name: "aac",
        tags: { language: "por", title: "Portuguese" },
      },
      {
        index: 3,
        codec_type: "subtitle",
        codec_name: "subrip",
        tags: { language: "eng", title: "English Subs" },
      },
    ],
  });

  it("should parse ffprobe output and return streams", async () => {
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, validProbeOutput, "");
    });

    const result = await probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv");

    expect(result.streams).toHaveLength(4);
    expect(result.streams[0].codec_type).toBe("video");
    expect(result.streams[0].codec_name).toBe("h264");
    expect(result.streams[0].width).toBe(1920);
    expect(result.streams[0].height).toBe(1080);
    expect(result.streams[1].codec_type).toBe("audio");
    expect(result.streams[1].tags?.language).toBe("eng");
    expect(result.streams[3].codec_type).toBe("subtitle");
  });

  it("should handle ffprobe with minimal output (no audio/subtitle)", async () => {
    const minimalOutput = JSON.stringify({
      streams: [
        {
          index: 0,
          codec_type: "video",
          codec_name: "h264",
          width: 640,
          height: 360,
        },
      ],
    });

    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, minimalOutput, "");
    });

    const result = await probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv");

    expect(result.streams).toHaveLength(1);
    expect(result.streams[0].codec_type).toBe("video");
  });

  it("should throw FFprobeError when ffprobe is not found", async () => {
    const enoentError = new Error("ENOENT");
    (enoentError as NodeJS.ErrnoException).code = "ENOENT";
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(enoentError, null, null);
    });

    await expect(
      probeStream("/invalid/path/ffprobe", "http://example.com/video.mkv"),
    ).rejects.toThrow(FFprobeError);

    await expect(
      probeStream("/invalid/path/ffprobe", "http://example.com/video.mkv"),
    ).rejects.toMatchObject({
      code: "FFPROBE_NOT_FOUND",
    });
  });

  it("should throw FFprobeError on timeout", async () => {
    const timeoutError = new Error("ETIMEDOUT");
    (timeoutError as NodeJS.ErrnoException).killed = true;
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(timeoutError, null, null);
    });

    await expect(
      probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv", 100),
    ).rejects.toMatchObject({
      code: "TIMEOUT",
    });
  });

  it("should throw FFprobeError on invalid JSON output", async () => {
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, "not-json", "");
    });

    await expect(
      probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv"),
    ).rejects.toMatchObject({
      code: "PARSE_ERROR",
    });
  });

  it("should throw FFprobeError when streams array is missing", async () => {
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, JSON.stringify({}), "");
    });

    await expect(
      probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv"),
    ).rejects.toMatchObject({
      code: "INVALID_OUTPUT",
    });
  });

  it("should handle streams without tags gracefully", async () => {
    const noTagsOutput = JSON.stringify({
      streams: [
        {
          index: 0,
          codec_type: "video",
          codec_name: "h264",
        },
        {
          index: 1,
          codec_type: "audio",
          codec_name: "aac",
        },
      ],
    });

    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, noTagsOutput, "");
    });

    const result = await probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv");

    expect(result.streams).toHaveLength(2);
    expect(result.streams[1].tags).toBeUndefined();
  });

  it("should pass the correct ffprobe arguments", async () => {
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(null, validProbeOutput, "");
    });

    await probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv");

    expect(mockExecFile).toHaveBeenCalledWith(
      "/usr/bin/ffprobe",
      ["-v", "debug", "-print_format", "json", "-show_streams", "http://example.com/video.mkv"],
      { timeout: 30000 },
      expect.any(Function),
    );
  });

  it("should resolveRedirect follow redirects and return final URL", async () => {
    mockFetch.mockResolvedValue({ url: "http://cdn.example.com/redirected/video.mkv" });

    const { resolveRedirect } = await import("@/main/ffprobe-prober");
    const result = await resolveRedirect("http://short.url/video.mkv");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://short.url/video.mkv",
      expect.objectContaining({ method: "GET", redirect: "follow" }),
    );
    expect(result).toBe("http://cdn.example.com/redirected/video.mkv");
  });

  it("should throw FFprobeError with code CRASHED on signal (segfault)", async () => {
    const signalError = new Error("Command failed: signal SIGSEGV");
    (signalError as NodeJS.ErrnoException & { signal?: string }).signal = "SIGSEGV";
    mockExecFile.mockImplementation((
      _file: string,
      _args: string[],
      _options: { timeout?: number },
      cb: ExecFileCallback,
    ) => {
      cb(signalError, "", "crash info");
    });

    await expect(
      probeStream("/usr/bin/ffprobe", "http://example.com/video.mkv"),
    ).rejects.toMatchObject({
      code: "CRASHED",
      message: expect.stringContaining("SIGSEGV"),
    });
  });
});
