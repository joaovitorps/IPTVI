import { DuplicateUsernameError } from "@/core/domain/use-cases/error/duplicate-username-error";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Create playlist use case", () => {
  let playlistRepo: InMemoryPlaylistRepository;
  let sut: CreatePlaylistUseCase;

  beforeEach(() => {
    playlistRepo = new InMemoryPlaylistRepository();
    sut = new CreatePlaylistUseCase(playlistRepo);
  });

  it("should be able to create a new playlist", async () => {
    sut = new CreatePlaylistUseCase(playlistRepo);

    const data = {
      name: "Test",
      server: "https://test.com",
      username: "u",
      password: "p",
    };

    const { playlist } = await sut.execute(data);

    expect(playlistRepo.playlists).toHaveLength(1);
    expect(playlistRepo.playlists[0]).toMatchObject(data);
    expect(playlist.isActive).toBe(false);
  });

  it("should not create a new playlist if username already exists", async () => {
    const username = "username";

    const { playlist } = makePlaylist({ username });

    playlistRepo.create(playlist);

    await expect(() =>
      sut.execute({
        name: playlist.name,
        server: playlist.server,
        username,
        password: playlist.password,
      }),
    ).rejects.toThrow(DuplicateUsernameError);

    expect(playlistRepo.playlists).toHaveLength(1);
  });
});
