import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { GetSerieByIdUseCase } from "@/core/domain/use-cases/series/get-serie-by-id";

export const getSeriById = async (serieId: number) => {
  const storeRepo = new StorePlaylistRepository();
  const playlists = await storeRepo.fetchActives();

  if (playlists.length === 0) throw new Error("No active playlist");

  const { server, username, password } = playlists[0];
  const getSerieByIdUseCase = new GetSerieByIdUseCase(
    new APISeriesRepository(server, username, password),
  );

  const { serie } = await getSerieByIdUseCase.execute({
    serieId: String(serieId),
  });

  return serie.toJSON();
};
