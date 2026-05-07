import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface FetchActivePlaylistsUseCaseReturn {
  playlists: Playlist[];
}

export class FetchActivePlaylistsUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute(): FetchActivePlaylistsUseCaseReturn {
    const playlists = this.playlistRepository.fetchActives();

    return { playlists };
  }
}
