import { PlaylistRepository } from "../../repositories/playlist-repository";

export class GetPlaylist {
  constructor(private playlistRepository: PlaylistRepository) {}

  execute(id: string) {
    return this.playlistRepository.getPlaylist(id);
  }
}
