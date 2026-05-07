import { Serie } from "@/core/domain/entities/serie";
import { InMemorySeriesRepository } from "@/core/domain/repositories/in-memory/in-memory-series-repository";
import { FetchSeriesUseCase } from "@/core/domain/use-cases/fetch-series";
import { beforeEach, describe, expect, it } from "vitest";

describe("Fetch series use case", () => {
  let sut: FetchSeriesUseCase;
  let repository: InMemorySeriesRepository;

  beforeEach(() => {
    repository = new InMemorySeriesRepository();
    sut = new FetchSeriesUseCase(repository);
  });

  it("should be able to fetch series by category", async () => {
    const seriesData = Serie.create({
      name: "Test Series",
      categoryId: "1",
      cover: "cover.jpg",
      plot: "Some plot",
      cast: "Actor A",
      director: "Director B",
      genre: "Drama",
      releaseDate: "2024-01-01",
      lastModified: "2024-01-01",
      rating: 8.5,
      rating5based: 4.5,
      backdropPath: ["backdrop.jpg"],
      youtubeTrailer: "video_id",
      episodeRunTime: 45,
    });

    repository.series.push(seriesData);

    const { series } = await sut.execute({ categoryId: 1 });

    expect(series).toHaveLength(1);
    expect(series[0].name).toEqual("Test Series");
  });

  it("should return empty list if no series found for category", async () => {
    const { series } = await sut.execute({ categoryId: 999 });
    expect(series).toHaveLength(0);
  });
});
