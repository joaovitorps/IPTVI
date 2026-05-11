/* eslint-disable @typescript-eslint/require-await */
import { Serie } from "@/core/domain/entities/series/serie";
import { SeriesRepository } from "@/core/domain/repositories/series-repository";

export class InMemorySeriesRepository implements SeriesRepository {
  series: Serie[] = [];

  async getById(serieId: string): Promise<Serie | null> {
    const serie = this.series.find((serie) => serie.id === serieId);

    if (!serie) {
      return null;
    }

    return serie;
  }

  async fetchByCategoryId(categoryId: number): Promise<Serie[]> {
    const series = this.series.filter(
      (item) => Number(item.categoryId) === categoryId,
    );

    return await Promise.resolve(series);
  }
}
