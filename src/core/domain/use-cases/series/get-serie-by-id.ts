import { Serie } from "../../entities/series/serie";
import { SeriesRepository } from "../../repositories/series-repository";

interface GetSerieByIdUseCaseParams {
  serieId: string;
}

interface GetSerieByIdUseCaseReturn {
  serie: Serie;
}

export class GetSerieByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute({
    serieId,
  }: GetSerieByIdUseCaseParams): Promise<GetSerieByIdUseCaseReturn> {
    const serie = await this.seriesRepository.getById(serieId);

    if (!serie) {
      throw new Error("Serie not found.");
    }

    return { serie };
  }
}
