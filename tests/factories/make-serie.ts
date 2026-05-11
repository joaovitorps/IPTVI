import { Serie } from "@/core/domain/entities/series/serie";
import { faker } from "@faker-js/faker";

export function makeSerie(overwrite: Partial<Serie> = {}, id?: string) {
  const serieCreated = Serie.create(
    {
      name: faker.lorem.sentence(),
      categoryId: faker.number.int(),
      cover: faker.image.dataUri(),
      plot: faker.lorem.text(),
      cast: faker.lorem.sentence(),
      director: faker.person.fullName(),
      genre: faker.person.gender(),
      releaseDate: "2024-01-01",
      lastModified: "2024-01-01",
      rating: faker.number.float(),
      rating5based: faker.number.float(),
      backdropPath: [faker.image.dataUri()],
      youtubeTrailer: faker.string.ulid(),
      episodeRunTime: 45,
      seasons: [],
      ...overwrite,
    },
    id,
  );

  return { serieCreated };
}
