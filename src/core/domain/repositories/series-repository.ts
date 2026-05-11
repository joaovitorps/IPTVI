import { Serie } from "../entities/series/serie";

export interface SeriesRepository {
  getById(serieId: string): Promise<Serie | null>;
  fetchByCategoryId(categoryId: number): Promise<Serie[]>;
}
