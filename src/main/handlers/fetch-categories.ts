import { APICategoryRepository } from "@/core/domain/repositories/api/api-category-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";
import { CategoryDTO } from "@/shared/types/ipc";

export const fetchCategories = async (): Promise<CategoryDTO[]> => {
  const storeRepo = new StorePlaylistRepository();
  const playlists = await storeRepo.fetchActives();

  if (playlists.length === 0) throw new Error("No active playlist");

  const { server, username, password } = playlists[0];
  const fetchCategory = new FetchCategoryUseCase(
    new APICategoryRepository(server, username, password),
  );

  const { categories } = await fetchCategory.execute();

  return categories.map((category) => category.toJSON());
};
