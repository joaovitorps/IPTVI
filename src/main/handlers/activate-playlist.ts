import { APICredentialRepository } from "@/core/domain/repositories/api/api-credential-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";

export const activatePlaylist = async (playlistId: string) => {
  const useCase = new ActivatePlaylistUseCase(
    new StorePlaylistRepository(),
    new APICredentialRepository(),
  );

  return useCase.execute({ playlistId });
};
