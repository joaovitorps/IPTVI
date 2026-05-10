import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { UpdatePlaylistUseCase } from "@/core/domain/use-cases/playlist/update-playlist";
import { UpdatePlaylist } from "@/shared/types";

export const updatePlaylist = async ({ playlistId, data }: UpdatePlaylist) => {
  const updatePlaylist = new UpdatePlaylistUseCase(
    new StorePlaylistRepository(),
  );

  const { playlist } = await updatePlaylist.execute({ playlistId, ...data });

  if (!playlist) {
    return false;
  }

  return playlist;
};
