import { APICategoryRepository } from "@/core/domain/repositories/api/api-category-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";
import { FetchActivePlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-active-playlists";

export const fetchCategories = async () => {
  const fetchActivePlaylists = new FetchActivePlaylistsUseCase(
    new StorePlaylistRepository(),
  );

  const { playlists } = fetchActivePlaylists.execute();

  if (playlists.length === 0) throw new Error("No active playlist");

  const fetchCategory = new FetchCategoryUseCase(
    new APICategoryRepository(playlists[0].credentials),
  );

  const { categories } = await fetchCategory.execute();

  return categories;
};
