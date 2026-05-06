import { PlaylistRepository } from "../../repositories/playlist-repository";

export class GetActivePlaylist {
  constructor(private playlistRepository: PlaylistRepository) {}

  execute() {
    return this.playlistRepository.getActivePlaylist();
  }
}
