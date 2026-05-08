import { Serie } from "../../entities/series/serie";
import { SeriesRepository } from "../series-repository";

export class InMemorySeriesRepository implements SeriesRepository {
  series: Serie[] = [];

  async fetchByCategory(categoryId: number): Promise<Serie[]> {
    const series = this.series.filter(
      (item) => Number(item.categoryId) === categoryId,
    );
    return await Promise.resolve(series);
  }
}
