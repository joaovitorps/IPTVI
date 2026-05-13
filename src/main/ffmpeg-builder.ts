import { HlsTrackInfo } from "@/shared/types/ipc";

import { FFprobeResult } from "./ffprobe-prober";

export interface FfmpegBuildResult {
  args: string[];
  tracks: HlsTrackInfo[];
}

export class FfmpegBuildError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "FfmpegBuildError";
  }
}

export function buildFfmpegArgs(
  probeResult: FFprobeResult,
  inputUrl: string,
  outputDir: string,
): FfmpegBuildResult {
  const streams = probeResult.streams;
  const args: string[] = [];
  const tracks: HlsTrackInfo[] = [];
  let nextId = 0;

  const videoStreams = streams.filter((s) => s.codec_type === "video");
  const audioStreams = streams.filter((s) => s.codec_type === "audio");
  const subtitleStreams = streams.filter((s) => s.codec_type === "subtitle");

  if (videoStreams.length === 0) {
    throw new FfmpegBuildError(
      "No video streams found in input",
      "NO_VIDEO_STREAMS",
    );
  }

  args.push("-i", inputUrl);

  const firstVideo = videoStreams[0];
  args.push(
    "-map", "0:v:0",
    "-c:v", "libx264",
    "-b:v:0", "3000k",
    "-s:v:0", "1280x720",
  );
  tracks.push({
    id: nextId++,
    type: "video",
    name: "720p",
    bitrate: 3000,
  });

  args.push(
    "-map", "0:v:0",
    "-c:v", "libx264",
    "-b:v:1", "1000k",
    "-s:v:1", "640x360",
  );
  tracks.push({
    id: nextId++,
    type: "video",
    name: "360p",
    bitrate: 1000,
  });

  for (let i = 0; i < audioStreams.length; i++) {
    const stream = audioStreams[i];
    const lang = stream.tags?.language || "und";
    const label = stream.tags?.title || (i === 0 ? "Default" : `Audio ${i}`);

    args.push(
      "-map", `0:a:${i}`,
      "-c:a", "aac",
      "-b:a", "128k",
    );

    tracks.push({
      id: nextId++,
      type: "audio",
      name: label,
      lang,
      default: i === 0,
    });
  }

  for (let i = 0; i < subtitleStreams.length; i++) {
    const stream = subtitleStreams[i];
    const lang = stream.tags?.language || "und";
    const label = stream.tags?.title || `Subtitle ${i}`;

    args.push(
      "-map", `0:s:${i}`,
      "-c:s", "webvtt",
    );

    tracks.push({
      id: nextId++,
      type: "subtitle",
      name: label,
      lang,
    });
  }

  args.push(
    "-f", "hls",
    "-hls_time", "6",
    "-hls_list_size", "0",
    "-master_pl_name", "master.m3u8",
    `${outputDir}/stream_%v.m3u8`,
  );

  return { args, tracks };
}
