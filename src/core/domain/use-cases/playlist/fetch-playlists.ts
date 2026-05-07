import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface FetchPlaylistsUseCaseParams {}

export interface FetchPlaylistsUseCaseReturn {
  playlists: Playlist[];
}

export class FetchPlaylistsUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(
    _params: FetchPlaylistsUseCaseParams,
  ): Promise<FetchPlaylistsUseCaseReturn> {
    const playlists = this.playlistRepository.fetchPlaylist();
    return { playlists };
  }
}
