import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { FetchActivePlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-active-playlists";
import { beforeEach, describe, expect, it } from "vitest";

describe("Get active playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: FetchActivePlaylistsUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new FetchActivePlaylistsUseCase(repository);
  });

  it("should be able to get the active playlist", () => {
    const playlist = Playlist.create({
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      isActive: true,
    });

    repository.playlists.push(playlist);

    const { playlists } = sut.execute();

    expect(playlists[0]).toBeInstanceOf(Playlist);
    expect(playlists[0].isActive).toBe(true);
  });

  it("should return empty array if there is no active playlist", () => {
    const { playlists } = sut.execute();

    expect(playlists).toHaveLength(0);
  });
});
