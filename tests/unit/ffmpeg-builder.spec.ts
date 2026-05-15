import { describe, it, expect } from "vitest";
import { buildFfmpegArgs, FfmpegBuildError } from "@/main/ffmpeg-builder";
import { FFprobeResult } from "@/main/ffprobe-prober";

describe("FFmpegArgsBuilder", () => {
  it("should build args for video+audio+subtitle streams", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264", width: 1920, height: 1080 },
        { index: 1, codec_type: "audio", codec_name: "aac", tags: { language: "eng", title: "English" } },
        { index: 2, codec_type: "audio", codec_name: "aac", tags: { language: "por", title: "Portuguese" } },
        { index: 3, codec_type: "subtitle", codec_name: "subrip", tags: { language: "eng" } },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    expect(result.args).toContain("-i");
    expect(result.args).toContain("http://example.com/video.mkv");

    expect(result.args).toContain("-map");
    expect(result.args).toContain("0:v:0");
    expect(result.args).toContain("-c:v");
    expect(result.args).toContain("libx264");
    expect(result.args).toContain("-b:v:0");
    expect(result.args).toContain("3000k");
    expect(result.args).toContain("-s:v:0");
    expect(result.args).toContain("1280x720");
    expect(result.args).toContain("-b:v:1");
    expect(result.args).toContain("1000k");
    expect(result.args).toContain("-s:v:1");
    expect(result.args).toContain("640x360");

    expect(result.args).toContain("0:a:0");
    expect(result.args).toContain("0:a:1");

    expect(result.args).toContain("0:s:0");

    expect(result.args).toContain("-c:s");
    expect(result.args).toContain("webvtt");

    expect(result.args).toContain("-var_stream_map");
    const varMapIdx = result.args.indexOf("-var_stream_map");
    const varMapVal = result.args[varMapIdx + 1];
    expect(varMapVal).toContain("a:0,agroup:aud,name:English,language:eng,default:yes");
    expect(varMapVal).toContain("a:1,agroup:aud,name:Portuguese,language:por,default:no");
    expect(varMapVal).toContain("s:0,sgroup:subs,name:Subtitle 0,language:eng");
    expect(varMapVal).toContain("v:0,agroup:aud,s:0,sgroup:subs");
    expect(varMapVal).toContain("v:1,agroup:aud");

    expect(result.args).toContain("-f");
    expect(result.args).toContain("hls");
    expect(result.args).toContain("-hls_time");
    expect(result.args).toContain("6");
    expect(result.args).toContain("-hls_list_size");
    expect(result.args).toContain("0");
    expect(result.args).toContain("-master_pl_name");
    expect(result.args).toContain("master.m3u8");
    expect(result.args).toContain("/tmp/hls/test/stream_%v.m3u8");
  });

  it("should build tracks metadata correctly", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264", width: 1920, height: 1080 },
        { index: 1, codec_type: "audio", codec_name: "aac", tags: { language: "eng", title: "English" } },
        { index: 2, codec_type: "subtitle", codec_name: "subrip", tags: { language: "por" } },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    expect(result.tracks).toHaveLength(4);

    expect(result.tracks[0]).toMatchObject({
      id: 0,
      type: "video",
      name: "720p",
      bitrate: 3000,
    });
    expect(result.tracks[1]).toMatchObject({
      id: 1,
      type: "video",
      name: "360p",
      bitrate: 1000,
    });
    expect(result.tracks[2]).toMatchObject({
      id: 2,
      type: "audio",
      name: "English",
      lang: "eng",
      default: true,
    });
    expect(result.tracks[3]).toMatchObject({
      id: 3,
      type: "subtitle",
      name: "Subtitle 0",
      lang: "por",
    });
  });

  it("should handle video-only streams", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264", width: 1280, height: 720 },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    expect(result.tracks).toHaveLength(2);
    expect(result.tracks.every((t) => t.type === "video")).toBe(true);
    expect(result.args.filter((a) => a.startsWith("0:a:")).length).toBe(0);
    expect(result.args.filter((a) => a.startsWith("0:s:")).length).toBe(0);
  });

  it("should handle streams with no tags", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac" },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    const audioTrack = result.tracks.find((t) => t.type === "audio");
    expect(audioTrack).toBeDefined();
    expect(audioTrack!.lang).toBe("und");
    expect(audioTrack!.name).toBe("Default");
    expect(audioTrack!.default).toBe(true);
  });

  it("should handle multiple audio tracks with correct default", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac", tags: { language: "eng" } },
        { index: 2, codec_type: "audio", codec_name: "aac", tags: { language: "por" } },
        { index: 3, codec_type: "audio", codec_name: "aac", tags: { language: "spa" } },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    const audioTracks = result.tracks.filter((t) => t.type === "audio");
    expect(audioTracks).toHaveLength(3);

    expect(audioTracks[0].default).toBe(true);
    expect(audioTracks[1].default).toBe(false);
    expect(audioTracks[2].default).toBe(false);
  });

  it("should handle multiple subtitle streams", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac" },
        { index: 2, codec_type: "subtitle", codec_name: "subrip", tags: { language: "eng" } },
        { index: 3, codec_type: "subtitle", codec_name: "subrip", tags: { language: "por" } },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    const subtitleTracks = result.tracks.filter((t) => t.type === "subtitle");
    expect(subtitleTracks).toHaveLength(2);
    expect(result.tracks).toHaveLength(5);

    expect(result.args).toContain("0:s:0");
    expect(result.args).toContain("0:s:1");

    expect(result.args).toContain("-var_stream_map");
    const varMapIdx = result.args.indexOf("-var_stream_map");
    const varMapVal = result.args[varMapIdx + 1];
    expect(varMapVal).toContain("s:0,sgroup:subs,name:Subtitle 0,language:eng");
    expect(varMapVal).toContain("s:1,sgroup:subs,name:Subtitle 1,language:por");
    expect(varMapVal).toContain("v:0,agroup:aud,s:0,sgroup:subs");
    expect(varMapVal).toContain("v:1,agroup:aud,s:1,sgroup:subs");
  });

  it("should use non-zero stream indices correctly", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "data", codec_name: "bin_data" },
        { index: 1, codec_type: "video", codec_name: "h264" },
        { index: 2, codec_type: "audio", codec_name: "aac" },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    expect(result.args).toContain("0:v:0");
    expect(result.args).toContain("0:a:0");
  });

  it("should throw when no video streams exist", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "audio", codec_name: "aac" },
      ],
    };

    expect(() =>
      buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test"),
    ).toThrow(FfmpegBuildError);
  });

  it("should include correct MIME types in output path", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac" },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/my-stream");

    expect(result.args).toContain("/tmp/hls/my-stream/stream_%v.m3u8");
  });

  it("should skip bitmap subtitle codecs like PGS and DVD subtitle", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac" },
        { index: 2, codec_type: "subtitle", codec_name: "hdmv_pgs_subtitle", tags: { language: "eng" } },
        { index: 3, codec_type: "subtitle", codec_name: "dvd_subtitle", tags: { language: "por" } },
      ],
    };

    const result = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    const subtitleTracks = result.tracks.filter((t) => t.type === "subtitle");
    expect(subtitleTracks).toHaveLength(0);
    expect(result.args.filter((a) => a.startsWith("0:s:")).length).toBe(0);
  });

  it("should produce deterministic args for same input", () => {
    const probe: FFprobeResult = {
      streams: [
        { index: 0, codec_type: "video", codec_name: "h264" },
        { index: 1, codec_type: "audio", codec_name: "aac", tags: { language: "eng" } },
      ],
    };

    const result1 = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");
    const result2 = buildFfmpegArgs(probe, "http://example.com/video.mkv", "/tmp/hls/test");

    expect(result1.args).toEqual(result2.args);
    expect(result1.tracks).toEqual(result2.tracks);
  });
});
