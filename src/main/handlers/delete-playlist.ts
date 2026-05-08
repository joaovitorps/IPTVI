import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { DeletePlaylistUseCase } from "@/core/domain/use-cases/playlist/delete-playlist";

export const deletePlaylist = (playlistId: string) => {
  const deletePlaylist = new DeletePlaylistUseCase(new StorePlaylistRepository());

  deletePlaylist.execute({ playlistId });
};
