import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";

export interface GetPlaylistUseCaseParams {
  id: string;
}

export interface GetPlaylistUseCaseReturn {
  playlist: Playlist;
}

export class GetPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute({ id }: GetPlaylistUseCaseParams): GetPlaylistUseCaseReturn {
    const playlist = this.playlistRepository.getById(id);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    return { playlist };
  }
}
