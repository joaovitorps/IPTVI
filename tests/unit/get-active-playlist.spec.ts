import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { GetActivePlaylist } from "@/core/domain/use-cases/playlist/get-active-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Get active playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: GetActivePlaylist;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new GetActivePlaylist(repository);
  });

  it("should be able to get the active playlist", () => {
    const playlist = Playlist.create({
      id: "1",
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 1,
      created_at: new Date().toISOString(),
    });

    repository.playlists.push(playlist);
    repository.activePlaylistId = "1";

    const result = sut.execute();

    expect(result).toBeInstanceOf(Playlist);
    expect(result?.id).toBe("1");
  });

  it("should return null if there is no active playlist", () => {
    const result = sut.execute();
    expect(result).toBeNull();
  });
});
