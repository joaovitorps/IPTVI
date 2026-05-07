import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface GetActivePlaylistUseCaseParams {}

export interface GetActivePlaylistUseCaseReturn {
  playlist: Playlist | null;
}

export class GetActivePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(
    _params: GetActivePlaylistUseCaseParams,
  ): Promise<GetActivePlaylistUseCaseReturn> {
    const playlist = this.playlistRepository.getActivePlaylist();
    return { playlist };
  }
}
