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

const MAX_HLS_SUBTITLE_RENDITIONS = 2;

/** Subtitle codecs we attempt to package as WebVTT for HLS. Bitmap-based codecs are skipped. */
export function isWebVttPackagableSubtitleCodec(codecName: string | undefined): boolean {
  if (!codecName) return false;
  const c = codecName.toLowerCase();
  const bitmap = new Set([
    "hdmv_pgs_subtitle",
    "dvd_subtitle",
    "dvb_subtitle",
    "xsub",
    "dvdsub",
    "pgssub",
  ]);
  if (bitmap.has(c)) return false;
  const textish = new Set([
    "subrip",
    "srt",
    "ass",
    "ssa",
    "mov_text",
    "webvtt",
    "text",
    "eia_608",
  ]);
  return textish.has(c);
}

function sanitizeVarStreamToken(value: string): string {
  return value.replace(/,/g, "_").replace(/\s+/g, " ").trim().slice(0, 64) || "und";
}

function buildVarStreamMapParts(
  audioStreams: { label: string; lang: string; default: boolean }[],
  subtitleOutputCount: number,
): string[] {
  const parts: string[] = [];
  const hasAudio = audioStreams.length > 0;

  for (let i = 0; i < audioStreams.length; i++) {
    const { label, lang, default: isDefault } = audioStreams[i];
    const name = sanitizeVarStreamToken(label);
    const language = sanitizeVarStreamToken(lang);
    parts.push(
      `a:${i},agroup:aud,name:${name},language:${language}${isDefault ? ",default:yes" : ",default:no"}`,
    );
  }

  if (hasAudio) {
    if (subtitleOutputCount === 0) {
      parts.push("v:0,agroup:aud", "v:1,agroup:aud");
    } else if (subtitleOutputCount === 1) {
      parts.push("v:0,agroup:aud,s:0,sgroup:subs", "v:1,agroup:aud");
    } else {
      parts.push("v:0,agroup:aud,s:0,sgroup:subs", "v:1,agroup:aud,s:1,sgroup:subs");
    }
  } else if (subtitleOutputCount === 0) {
    parts.push("v:0", "v:1");
  } else if (subtitleOutputCount === 1) {
    parts.push("v:0,s:0,sgroup:subs", "v:1");
  } else {
    parts.push("v:0,s:0,sgroup:subs", "v:1,s:1,sgroup:subs");
  }

  return parts;
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

  const audioMeta: { label: string; lang: string; default: boolean }[] = [];

  for (let i = 0; i < audioStreams.length; i++) {
    const stream = audioStreams[i];
    const lang = stream.tags?.language || "und";
    const label = stream.tags?.title || (i === 0 ? "Default" : `Audio ${i}`);

    args.push(
      "-map", `0:a:${i}`,
      "-c:a", "aac",
      "-b:a", "128k",
    );

    audioMeta.push({ label, lang, default: i === 0 });

    tracks.push({
      id: nextId++,
      type: "audio",
      name: label,
      lang,
      default: i === 0,
    });
  }

  const packagableSubtitleIndices: number[] = [];
  for (let i = 0; i < subtitleStreams.length; i++) {
    if (isWebVttPackagableSubtitleCodec(subtitleStreams[i].codec_name)) {
      packagableSubtitleIndices.push(i);
    }
  }

  const mappedSubtitleIndices = packagableSubtitleIndices.slice(0, MAX_HLS_SUBTITLE_RENDITIONS);
  const subtitleOutputCount = mappedSubtitleIndices.length;

  for (const i of mappedSubtitleIndices) {
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

  const varMapParts = buildVarStreamMapParts(audioMeta, subtitleOutputCount);

  args.push(
    "-f", "hls",
    "-hls_time", "6",
    "-hls_list_size", "0",
    "-hls_segment_type", "fmp4",
    "-hls_flags", "independent_segments",
    "-var_stream_map", varMapParts.join(" "),
    "-master_pl_name", "master.m3u8",
    `${outputDir}/stream_%v.m3u8`,
  );

  return { args, tracks };
}
