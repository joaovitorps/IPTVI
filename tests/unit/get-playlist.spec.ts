import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { GetPlaylist } from "@/core/domain/use-cases/playlist/get-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Get playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: GetPlaylist;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new GetPlaylist(repository);
  });

  it("should be able to get a playlist by id", () => {
    const playlist = Playlist.create({
      id: "1",
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 0,
      created_at: new Date().toISOString(),
    });

    repository.playlists.push(playlist);

    const result = sut.execute("1");

    expect(result).toBeInstanceOf(Playlist);
    expect(result?.id).toBe("1");
  });

  it("should return null if playlist is not found", () => {
    const result = sut.execute("non-existent-id");
    expect(result).toBeNull();
  });
});
