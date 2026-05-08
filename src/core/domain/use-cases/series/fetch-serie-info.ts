import { SerieInfo } from "../../entities/series/serie-info";
import { SeriesRepository } from "../../repositories/series-repository";

interface FetchSerieInfoUseCaseParams {
  serieId: number;
}

interface FetchSerieInfoUseCaseReturn {
  serieInfo: ReturnType<typeof SerieInfo.create>;
}

export class FetchSerieInfoUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute({
    serieId,
  }: FetchSerieInfoUseCaseParams): Promise<FetchSerieInfoUseCaseReturn> {
    const serieInfo = await this.seriesRepository.fetchSerieInfo(serieId);

    return { serieInfo };
  }
}
