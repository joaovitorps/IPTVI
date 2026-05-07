import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchPlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-playlists";

export const fetchPlaylists = () => {
  const { playlists } = new FetchPlaylistsUseCase(
    new StorePlaylistRepository(),
  ).execute();

  return playlists;
};
