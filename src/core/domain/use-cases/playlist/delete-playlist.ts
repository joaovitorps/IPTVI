import { PlaylistRepository } from "../../repositories/playlist-repository";

export interface DeletePlaylistUseCaseParams {
  playlistId: string;
}

export class DeletePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute({ playlistId }: DeletePlaylistUseCaseParams) {
    this.playlistRepository.delete(playlistId);
  }
}
