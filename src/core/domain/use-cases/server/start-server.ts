import { PlaylistRepository } from "../../repositories/playlist-repository";
import {
  StartStreamServerRepositoryParams,
  StreamServerRepository,
} from "../../repositories/stream-server-repository";
import {
  StreamServerError,
  StreamServerResult,
  StreamServerStatus,
} from "@/shared/types/ipc";

interface StartServerUseCaseParams {
  host?: string;
  port?: number;
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
  }: StartServerUseCaseParams): Promise<StartServerUseCaseReturn> {
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

    const params: StartStreamServerRepositoryParams = {
      playlistId: playlist.id,
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
      host,
      port,
    };

    const result = await this.streamServerRepository.start(params);

    return this.normalizeResult(result);
  }

  private normalizeResult(result: StreamServerResult): StartServerUseCaseReturn {
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
