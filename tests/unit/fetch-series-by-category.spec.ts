import { FetchSeriesByCategoryUseCase } from "@/core/domain/use-cases/series/fetch-series-by-category";
import { makeSerie } from "@tests/factories/make-serie";
import { InMemorySeriesRepository } from "@tests/repositories/in-memory-series-repository";

describe("Fetch series by category use case", () => {
  let sut: FetchSeriesByCategoryUseCase;
  let repository: InMemorySeriesRepository;

  beforeEach(() => {
    repository = new InMemorySeriesRepository();
    sut = new FetchSeriesByCategoryUseCase(repository);
  });

  it("should be able to fetch series by category", async () => {
    const { serieCreated } = makeSerie({ categoryId: 1 });

    repository.series.push(serieCreated);

    const { series } = await sut.execute({ categoryId: 1 });

    expect(series).toHaveLength(1);
    expect(series[0].name).toEqual(serieCreated.name);
  });

  it("should return empty list if no series found for category", async () => {
    const { series } = await sut.execute({ categoryId: 999 });

    expect(series).toHaveLength(0);
  });
});
