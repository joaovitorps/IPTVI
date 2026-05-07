import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { UpdatePlaylistUseCase } from "@/core/domain/use-cases/playlist/update-playlist";
import { UpdatePlaylist } from "@/shared/types";

export const updatePlaylist = ({ playlistId, data }: UpdatePlaylist) => {
  const updatePlaylist = new UpdatePlaylistUseCase(
    new StorePlaylistRepository(),
  );

  const updated = updatePlaylist.execute({ playlistId, data });

  if (!updated) {
    return false;
  }

  return updated.playlist;
};
