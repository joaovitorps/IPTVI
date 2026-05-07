import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { FetchPlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-playlists";
import { beforeEach, describe, expect, it } from "vitest";

describe("Fetch playlists use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: FetchPlaylistsUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new FetchPlaylistsUseCase(repository);
  });

  it("should be able to fetch all playlists", async () => {
    const playlist1 = Playlist.create({
      id: "1",
      name: "Test Playlist 1",
      credentials: {
        server: "http://test1.com",
        username: "u1",
        password: "p1",
      },
      is_active: 0,
      created_at: new Date().toISOString(),
    });

    const playlist2 = Playlist.create({
      id: "2",
      name: "Test Playlist 2",
      credentials: {
        server: "http://test2.com",
        username: "u2",
        password: "p2",
      },
      is_active: 0,
      created_at: new Date().toISOString(),
    });

    repository.playlists.push(playlist1, playlist2);

    const { playlists } = await sut.execute({});

    expect(playlists).toHaveLength(2);
    expect(playlists).toContain(playlist1);
    expect(playlists).toContain(playlist2);
  });

  it("should return an empty array if there are no playlists", async () => {
    const { playlists } = await sut.execute({});
    expect(playlists).toEqual([]);
  });
});
