import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { GetPlaylistUseCase } from "@/core/domain/use-cases/playlist/get-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Get playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: GetPlaylistUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new GetPlaylistUseCase(repository);
  });

  it("should be able to get a playlist by id", () => {
    const playlist = Playlist.create(
      {
        name: "Test Playlist",
        credentials: {
          server: "http://test.com",
          username: "u",
          password: "p",
        },
      },
      "1",
    );

    repository.playlists.push(playlist);

    const { playlist: result } = sut.execute({ id: "1" });

    expect(result).toBeInstanceOf(Playlist);
    expect(result?.id).toBe("1");
  });

  it("should return null if playlist is not found", () => {
    const { playlist: result } = sut.execute({ id: "non-existent-id" });
    expect(result).toBeNull();
  });
});
