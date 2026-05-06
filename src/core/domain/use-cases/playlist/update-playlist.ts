import { Playlist } from "../entities/playlist";
import { PlaylistRepository } from "../repositories/playlist-repository";

export class UpdatePlaylist {
  constructor(private playlistRepository: PlaylistRepository) {}

  execute(id: string, playlist: Playlist) {
    return this.playlistRepository.updatePlaylist(id, playlist);
  }
}
