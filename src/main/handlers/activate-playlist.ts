import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";

export const activatePlaylist = async (playlistId: string) => {
  const useCase = new ActivatePlaylistUseCase(new StorePlaylistRepository());
  await useCase.execute({ playlistId });
};
