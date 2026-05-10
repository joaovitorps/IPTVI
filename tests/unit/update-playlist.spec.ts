import { UpdatePlaylistUseCase } from "@/core/domain/use-cases/playlist/update-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";
import { beforeEach, describe, expect, it } from "vitest";

describe("Update playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: UpdatePlaylistUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new UpdatePlaylistUseCase(repository);
  });

  it("should be able to update a playlist", async () => {
    const { playlist } = makePlaylist();

    repository.playlists.push(playlist);

    await sut.execute({ playlistId: playlist.id, name: "New Name" });

    expect(repository.playlists[0].name).toBe("New Name");
    expect(repository.playlists[0].id).toBe(playlist.id);
  });

  it("should update the name to 'Unnamed Profile' if receive a empty string", async () => {
    const { playlist } = makePlaylist({ name: "" });

    repository.playlists.push(playlist);

    await sut.execute({ playlistId: playlist.id, name: "" });

    expect(repository.playlists[0].name).toEqual("Unnamed Profile");
  });
});
