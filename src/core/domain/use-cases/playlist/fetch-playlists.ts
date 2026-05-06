import { PlaylistRepository } from "../../repositories/playlist-repository";

export class FetchPlaylists {
  constructor(private playlistRepository: PlaylistRepository) {}

  execute() {
    return this.playlistRepository.fetchPlaylist();
  }
}
