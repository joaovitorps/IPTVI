import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface UpdatePlaylistUseCaseParams {
  id: string;
  playlist: Playlist;
}

export interface UpdatePlaylistUseCaseReturn {}

export class UpdatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(
    params: UpdatePlaylistUseCaseParams,
  ): Promise<UpdatePlaylistUseCaseReturn> {
    this.playlistRepository.updatePlaylist(params.id, params.playlist);
    return {};
  }
}
