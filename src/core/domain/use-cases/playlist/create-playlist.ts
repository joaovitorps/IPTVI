import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { DuplicateUsernameError } from "../error/duplicate-username-error";

interface CreatePlaylistUseCaseParams {
  name: string;
  server: string;
  username: string;
  password: string;
}

interface CreatePlaylistUseCaseReturn {
  playlist: Playlist;
}

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute({
    name,
    server,
    username,
    password,
  }: CreatePlaylistUseCaseParams): Promise<CreatePlaylistUseCaseReturn> {
    const duplicatedUsername = this.playlistRepository.getByUsername(username);

    if (duplicatedUsername) {
      throw new DuplicateUsernameError();
    }

    const activePlaylists = await this.playlistRepository.fetchActives();

    if (activePlaylists.length > 0) {
      throw new Error("There is already a playlist active.");
    }

    const playlist = Playlist.create({
      name,
      server,
      username,
      password,
    });

    this.playlistRepository.create(playlist);

    return { playlist };
  }
}
