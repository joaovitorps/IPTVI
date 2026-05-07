import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";
import { CreatePlaylist } from "@/shared/types";

export const createPlaylist = ({ name, credentials }: CreatePlaylist) => {
  const { playlist } = new CreatePlaylistUseCase(
    new StorePlaylistRepository(),
  ).execute({ name, credentials, isActive: true });

  return playlist;
};
