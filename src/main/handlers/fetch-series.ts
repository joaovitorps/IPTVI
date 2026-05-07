import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchActivePlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-active-playlists";
import { FetchSeriesUseCase } from "@/core/domain/use-cases/series/fetch-series";

export const fetchSeries = async (categoryId: number) => {
  const fetchActivePlaylists = new FetchActivePlaylistsUseCase(
    new StorePlaylistRepository(),
  );

  const { playlists } = fetchActivePlaylists.execute();

  if (playlists.length === 0) throw new Error("No active playlist");

  const fetchSeries = new FetchSeriesUseCase(
    new APISeriesRepository(playlists[0].credentials),
  );

  const { series } = await fetchSeries.execute({ categoryId });

  return series;
};
