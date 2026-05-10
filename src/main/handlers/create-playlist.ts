import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";
import { CreatePlaylistParams } from "@/shared/types/ipc";

export const createPlaylist = async ({
  name,
  server,
  username,
  password,
}: CreatePlaylistParams) => {
  const useCase = new CreatePlaylistUseCase(new StorePlaylistRepository());
  const { playlist } = await useCase.execute({
    name,
    server,
    username,
    password,
  });

  return playlist;
};
