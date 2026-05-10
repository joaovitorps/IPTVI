import { Serie } from "../entities/series/serie";

export interface SeriesRepository {
  getById(serieId: number): Promise<Serie>;
  fetchByCategoryId(categoryId: number): Promise<Serie[]>;
}
