import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";
import { beforeEach, describe, expect, it } from "vitest";

describe("Create playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: CreatePlaylistUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new CreatePlaylistUseCase(repository);
  });

  it("should be able to create a new playlist", async () => {
    const { playlist } = await sut.execute(
      Playlist.create(
        {
          name: "Test Playlist",
          credentials: {
            server: "http://test.com",
            username: "u",
            password: "p",
          },
        },
        "1",
      ),
    );

    expect(repository.playlists).toHaveLength(1);
    expect(repository.playlists[0]).toBe(playlist);
  });
});
