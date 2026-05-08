import { Serie } from "../entities/series/serie";
import { SerieInfo } from "../entities/series/serie-info";

export interface SeriesRepository {
  fetchByCategory(
    categoryId: number,
  ): Promise<ReturnType<typeof Serie.create>[]>;
  fetchSerieInfo(serieId: number): Promise<ReturnType<typeof SerieInfo.create>>;
}
