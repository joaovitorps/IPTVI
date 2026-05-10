import { SeriesRepository } from "@/core/domain/repositories/series-repository";
import { Serie } from "@/shared/schemas";

export class InMemorySeriesRepository implements SeriesRepository {
  series: Serie[] = [];

  async fetchByCategory(categoryId: number): Promise<Serie[]> {
    const series = this.series.filter(
      (item) => Number(item.categoryId) === categoryId,
    );
    return await Promise.resolve(series);
  }

  async fetchSerieInfo(serieId: number) {
    this.series.find((serie) => serie?.series_id === serieId);
  }
}
