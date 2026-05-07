import { Credentials } from "../../entities/object-values/credentials";
import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { DuplicateUsernameError } from "../error/duplicate-username-error";

interface CreatePlaylistUseCaseParams {
  name: string;
  credentials: Credentials;
  isActive?: boolean;
}

interface CreatePlaylistUseCaseReturn {
  playlist: Playlist;
}

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute({
    name,
    credentials,
    isActive = false,
  }: CreatePlaylistUseCaseParams): CreatePlaylistUseCaseReturn {
    const duplicatedUsername = this.playlistRepository.getByUsername(
      credentials.username,
    );

    if (duplicatedUsername) {
      throw new DuplicateUsernameError();
    }

    const playlist = Playlist.create({
      name,
      credentials,
      isActive,
    });

    this.playlistRepository.create(playlist);

    return { playlist };
  }
}
