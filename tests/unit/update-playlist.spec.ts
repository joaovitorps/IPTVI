import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { UpdatePlaylist } from "@/core/domain/use-cases/playlist/update-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Update playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: UpdatePlaylist;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new UpdatePlaylist(repository);
  });

  it("should be able to update a playlist", () => {
    const playlist = Playlist.create({
      id: "1",
      name: "Old Name",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 0,
      created_at: new Date().toISOString(),
    });

    repository.playlists.push(playlist);

    const updatedPlaylist = Playlist.create({
      ...playlist.toJSON(),
      name: "New Name",
    });

    sut.execute("1", updatedPlaylist);

    expect(repository.playlists[0].name).toBe("New Name");
  });
});
