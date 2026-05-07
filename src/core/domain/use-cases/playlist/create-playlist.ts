import { Credentials } from "@/shared/types";

import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

interface CreatePlaylistUseCaseParams {
  name: string;
  credentials: Credentials;
}

interface CreatePlaylistUseCaseReturn {
  playlist: Playlist;
}

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute({
    name,
    credentials,
  }: CreatePlaylistUseCaseParams): CreatePlaylistUseCaseReturn {
    const playlist = Playlist.create({ name, credentials });

    this.playlistRepository.create(playlist);

    return { playlist };
  }
}
