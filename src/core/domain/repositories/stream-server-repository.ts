import {
  StopStreamServerParams,
  StreamServerResult,
  StreamServerStatus,
} from "@/shared/types/ipc";

export interface StartStreamServerRepositoryParams {
  playlistId: string;
  server: string;
  username: string;
  password: string;
  host?: string;
  port?: number;
}

export interface StreamServerRepository {
  start(params: StartStreamServerRepositoryParams): Promise<StreamServerResult>;
  stop(params: StopStreamServerParams): Promise<StreamServerResult>;
  status(): StreamServerStatus;
}
