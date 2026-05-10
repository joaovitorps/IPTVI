import { SerieDTO } from "@/shared/types/dto";

import { Serie } from "../../entities/series/serie";
import { SeriesRepository } from "../../repositories/series-repository";

interface FetchSeriesByCategoryUseCaseParams {
  categoryId: number;
}

interface FetchSeriesByCategoryUseCaseReturn {
  series: Serie[];
}

export class FetchSeriesByCategoryUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute({
    categoryId,
  }: FetchSeriesByCategoryUseCaseParams): Promise<FetchSeriesByCategoryUseCaseReturn> {
    const series = await this.seriesRepository.fetchByCategoryId(categoryId);

    return { series };
  }
}
