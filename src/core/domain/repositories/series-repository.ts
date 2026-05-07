import { Serie } from "../entities/serie";
import { SerieInfo } from "../entities/serie-info";

export interface SeriesRepository {
  fetchByCategory(
    categoryId: number,
  ): Promise<ReturnType<typeof Serie.create>[]>;
  fetchSerieInfo(serieId: number): Promise<ReturnType<typeof SerieInfo.create>>;
}
