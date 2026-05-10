import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";

interface UpdatePlaylistUseCaseParams {
  playlistId: string;
  name?: string;
  server?: string;
  username?: string;
  password?: string;
}

interface UpdatePlaylistUseCaseReturn {
  playlist: Playlist;
}
export class UpdatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute({
    playlistId,
    name,
    server,
    username,
    password,
  }: UpdatePlaylistUseCaseParams): Promise<UpdatePlaylistUseCaseReturn> {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    playlist.name = name ?? playlist.name;
    playlist.server = server ?? playlist.server;
    playlist.username = username ?? playlist.username;
    playlist.password = password ?? playlist.password;

    await this.playlistRepository.save(playlist);

    return { playlist };
  }
}
