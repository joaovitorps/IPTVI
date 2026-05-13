export interface ValidateParams {
  server: string;
  username: string;
  password: string;
}

export interface CreatePlaylistParams {
  name: string;
  server: string;
  username: string;
  password: string;
}

export type StreamServerState =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error";

export interface HlsTrackInfo {
  id: number;
  type: "video" | "audio" | "subtitle";
  name: string;
  lang?: string;
  default?: boolean;
  bitrate?: number;
}

export type StreamServerErrorCode =
  | "ALREADY_RUNNING"
  | "NOT_RUNNING"
  | "NO_ACTIVE_PLAYLIST"
  | "SPAWN_FAILED"
  | "START_TIMEOUT"
  | "STOP_TIMEOUT"
  | "UNEXPECTED_EXIT"
  | "FFPROBE_ERROR"
  | "FFMPEG_ERROR"
  | "INTERNAL";

export interface StreamServerError {
  code: StreamServerErrorCode;
  message: string;
}

export interface StreamServerStatus {
  state: StreamServerState;
  pid?: number;
  host: string;
  port: number;
  baseUrl: string;
  playlistId?: string;
  hlsPlaylist?: string;
  tracks?: HlsTrackInfo[];
  startedAt?: string;
  lastError?: StreamServerError;
}

export interface StartStreamServerParams {
  host?: number;
  port?: number;
  streamId?: string;
}

export interface StartStreamServerParams {
  host?: string;
  port?: number;
}

export interface StopStreamServerParams {
  force?: boolean;
  reason?: string;
}

export type StreamServerResult =
  | {
      ok: true;
      status: StreamServerStatus;
    }
  | {
      ok: false;
      status: StreamServerStatus;
      error: StreamServerError;
    };

interface Success {
  isValid: true;
}

interface Failure {
  isValid: false;
  error: string;
}

export type ValidateReturn = Success | Failure;
