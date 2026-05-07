import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { Playlist } from "@/core/domain/entities/playlist";
import { InMemoryPlaylistRepository } from "@/core/domain/repositories/in-memory/in-memory-playlist-repository";
import { CreatePlaylistUseCase } from "@/core/domain/use-cases/playlist/create-playlist";

describe("Create playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: CreatePlaylistUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new CreatePlaylistUseCase(repository);
  });

  it("should be able to create a new playlist", () => {
    const { playlist } = sut.execute({
      name: "Test Playlist",
      credentials: Credentials.create("http://test.com", "u", "p"),
    });

    expect(repository.playlists).toHaveLength(1);
    expect(repository.playlists[0]).toBe(playlist);
    expect(playlist.isActive).toBe(false);
  });

  it("should not create a new playlist if username already exists", () => {
    const data = {
      name: "Test Playlist",
      credentials: Credentials.create("http://test.com", "username", "p"),
    };

    repository.create(
      Playlist.create({ name: data.name, credentials: data.credentials }),
    );

    expect(() => sut.execute(data)).toThrow("User already exists!");
    expect(repository.playlists).toHaveLength(1);
  });
});
