import { CredentialRepository } from "../../repositories/credential-repository";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";
import { InvalidCredentialsError } from "../error/invalid-credentials-error";

export interface ActivatePlaylistUseCaseParams {
  playlistId: string;
}

export interface ActivatePlaylistUseCaseReturn {
  activated: boolean;
}

export class ActivatePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly credentialRepository: CredentialRepository,
  ) {}

  async execute({
    playlistId,
  }: ActivatePlaylistUseCaseParams): Promise<ActivatePlaylistUseCaseReturn> {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    // Validate credentials BEFORE activating
    const validation = await this.credentialRepository.validate({
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
    });

    if (!validation.ok) {
      throw new InvalidCredentialsError(validation.data.error);
    }

    // Deactivate all other playlists first
    const activePlaylists = await this.playlistRepository.fetchActives();

    for (const activePlaylist of activePlaylists) {
      if (activePlaylist.id !== playlistId) {
        activePlaylist.isActive = false;
        await this.playlistRepository.save(activePlaylist);
      }
    }

    // Activate the target playlist
    playlist.isActive = true;
    await this.playlistRepository.save(playlist);

    return { activated: true };
  }
}
