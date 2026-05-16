import {
  StreamServerError,
  StreamServerResult,
  StreamServerStatus,
} from "@/shared/types/ipc";

import { PlaylistRepository } from "../../repositories/playlist-repository";
import {
  StartStreamServerRepositoryParams,
  StreamServerRepository,
} from "../../repositories/stream-server-repository";

interface StartServerUseCaseParams {
  host?: string;
  port?: number;
  streamId?: string;
}

interface StartServerUseCaseReturn {
  ok: boolean;
  status: StreamServerStatus;
  error?: StreamServerError;
}

export class StartServerUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly streamServerRepository: StreamServerRepository,
  ) {}

  async execute({
    host,
    port,
    streamId,
  }: StartServerUseCaseParams): Promise<StartServerUseCaseReturn> {
    const serverStatus = this.streamServerRepository.status();

    if (serverStatus.state in ["starting", "running", "stopping"]) {
      return {
        ok: false,
        status: this.streamServerRepository.status(),
      };
    }

    const activePlaylists = await this.playlistRepository.fetchActives();

    if (activePlaylists.length === 0) {
      return {
        ok: false,
        status: this.streamServerRepository.status(),
        error: {
          code: "NO_ACTIVE_PLAYLIST",
          message: "No active playlist found.",
        },
      };
    }

    const [playlist] = activePlaylists;

    console.info("[start-server] Playlist found:", playlist.id);

    const params: StartStreamServerRepositoryParams = {
      playlistId: playlist.id,
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
      host,
      port,
      streamId,
    };

    const result = await this.streamServerRepository.start(params);

    console.info("[start-server] start server response: ", result);

    return this.normalizeResult(result);
  }

  private normalizeResult(
    result: StreamServerResult,
  ): StartServerUseCaseReturn {
    if (result.ok) {
      return {
        ok: true,
        status: result.status,
      };
    }

    return {
      ok: false,
      status: result.status,
      error: result.error,
    };
  }
}
