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

  execute({ id }: GetPlaylistUseCaseParams): GetPlaylistUseCaseReturn {
    const playlist = this.playlistRepository.getById(id);

    return { playlist };
  }
}
