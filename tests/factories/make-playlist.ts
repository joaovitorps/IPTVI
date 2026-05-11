import { Playlist } from "@/core/domain/entities/playlist";
import { faker } from "@faker-js/faker";

export function makePlaylist(overwrite: Partial<Playlist> = {}, id?: string) {
  const playlist = Playlist.create(
    {
      name: faker.lorem.sentence(),
      server: faker.internet.url(),
      username: faker.internet.username(),
      password: faker.internet.password(),
      ...overwrite,
    },
    id,
  );

  return { playlist };
}
