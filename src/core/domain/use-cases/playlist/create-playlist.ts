import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export class CreatePlaylist {
  constructor(private playlistRepository: PlaylistRepository) {}

  execute(playlist: Playlist) {
    return this.playlistRepository.createPlaylist(playlist);
  }
}
