import { GetSerieByIdUseCase } from "@/core/domain/use-cases/series/get-serie-by-id";
import { makeSerie } from "@tests/factories/make-serie";
import { InMemorySeriesRepository } from "@tests/repositories/in-memory-series-repository";

describe("Fetch series by category use case", () => {
  let sut: GetSerieByIdUseCase;
  let repository: InMemorySeriesRepository;

  beforeEach(() => {
    repository = new InMemorySeriesRepository();
    sut = new GetSerieByIdUseCase(repository);
  });

  it("should be able to get a serie by id", async () => {
    const { serieCreated } = makeSerie();

    repository.series.push(serieCreated);

    const { serie } = await sut.execute({ serieId: serieCreated.id });

    expect(serie.name).toEqual(serieCreated.name);
  });
});
