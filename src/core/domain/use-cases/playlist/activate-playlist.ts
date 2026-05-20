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

    for (const activePlaylist of activePlaylists) {
      if (activePlaylist.id !== playlistId) {
        activePlaylist.isActive = false;
        await this.playlistRepository.save(activePlaylist);
      }
    }

    playlist.isActive = true;
    await this.playlistRepository.save(playlist);
  }
}
