import { Serie } from "../../entities/serie";
import { SeriesRepository } from "../../repositories/series-repository";

interface FetchSeriesUseCaseParams {
  categoryId: number;
}

interface FetchSeriesUseCaseReturn {
  series: Serie[];
}

export class FetchSeriesUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute({
    categoryId,
  }: FetchSeriesUseCaseParams): Promise<FetchSeriesUseCaseReturn> {
    const series = await this.seriesRepository.fetchByCategory(categoryId);

    return { series };
  }
}
