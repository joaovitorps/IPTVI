import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";

interface ActivatePlaylistUseCaseParams {
  playlistId: string;
}

export class ActivatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute({ playlistId }: ActivatePlaylistUseCaseParams): Promise<void> {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    const activePlaylists = await this.playlistRepository.fetchActives();

    if (activePlaylists.length > 0) {
      if (!activePlaylists.find((playlist) => playlist.id === playlistId)) {
        throw new Error("Other playlist is already active.");
      }
    }

    playlist.isActive = true;

    await this.playlistRepository.save(playlist);
  }
}
