import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { CreatePlaylist } from "@/core/domain/use-cases/playlist/create-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Create playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: CreatePlaylist;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new CreatePlaylist(repository);
  });

  it("should be able to create a new playlist", () => {
    const playlist = Playlist.create({
      id: "1",
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 0,
      created_at: new Date().toISOString(),
    });

    sut.execute(playlist);

    expect(repository.playlists).toHaveLength(1);
    expect(repository.playlists[0]).toBe(playlist);
  });
});
