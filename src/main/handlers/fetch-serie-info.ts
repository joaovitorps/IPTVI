import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { FetchActivePlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-active-playlists";
import { FetchSerieInfoUseCase } from "@/core/domain/use-cases/series/fetch-serie-info";

export const fetchSerieInfo = async (serieId: number) => {
  const fetchActivePlaylists = new FetchActivePlaylistsUseCase(
    new StorePlaylistRepository(),
  );

  const { playlists } = fetchActivePlaylists.execute();

  if (playlists.length === 0) throw new Error("No active playlist");

  const fetchSerieInfoUseCase = new FetchSerieInfoUseCase(
    new APISeriesRepository(playlists[0].credentials),
  );

  const { serieInfo } = await fetchSerieInfoUseCase.execute({ serieId });

  return serieInfo;
};
