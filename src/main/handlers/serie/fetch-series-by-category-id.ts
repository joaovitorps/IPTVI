import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchSeriesByCategoryUseCase } from "@/core/domain/use-cases/series/fetch-series-by-category";
import { SerieDTO } from "@/shared/types/dto";

export const fetchSeriesByCategoryId = async (
  categoryId: number,
): Promise<SerieDTO[]> => {
  const storeRepo = new StorePlaylistRepository();
  const playlists = await storeRepo.fetchActives();

  if (playlists.length === 0) throw new Error("No active playlist");

  const { server, username, password } = playlists[0];
  const fetchSeriesByCategoryId = new FetchSeriesByCategoryUseCase(
    new APISeriesRepository(server, username, password),
  );

  const { series } = await fetchSeriesByCategoryId.execute({ categoryId });

  return series.map((serie) => serie.toJSON());
};
