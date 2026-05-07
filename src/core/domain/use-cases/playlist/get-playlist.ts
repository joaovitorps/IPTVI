import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface GetPlaylistUseCaseParams {
  id: string;
}

export interface GetPlaylistUseCaseReturn {
  playlist: Playlist | null;
}

export class GetPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute(
    params: GetPlaylistUseCaseParams,
  ): Promise<GetPlaylistUseCaseReturn> {
    const playlist = this.playlistRepository.getPlaylist(params.id);
    return { playlist };
  }
}
