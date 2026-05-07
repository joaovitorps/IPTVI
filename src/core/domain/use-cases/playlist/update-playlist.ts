import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../../repositories/playlist-repository";

interface UpdatePlaylistUseCaseParams {
  playlistId: string;
  data: Partial<Pick<Playlist, "name" | "credentials" | "isActive">>;
}

interface UpdatePlaylistUseCaseReturn {
  playlist: Playlist;
}
export class UpdatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  execute({
    playlistId,
    data,
  }: UpdatePlaylistUseCaseParams): UpdatePlaylistUseCaseReturn | false {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new Error("Not found");
    }

    const playlistUpdated = this.playlistRepository.update(
      playlistId,
      Playlist.create({
        name: data.name ?? playlist.name,
        credentials: data.credentials ?? playlist.credentials,
        isActive: data.isActive ?? playlist.isActive,
      }),
    );

    if (!playlistUpdated) {
      return false;
    }

    return { playlist: playlistUpdated };
  }
}
