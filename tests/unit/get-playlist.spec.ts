import { Playlist } from "@/core/domain/entities/playlist";
import { EntityNotFoundError } from "@/core/domain/use-cases/error/entity-not-found-error";
import { GetPlaylistUseCase } from "@/core/domain/use-cases/playlist/get-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Get playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: GetPlaylistUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new GetPlaylistUseCase(repository);
  });

  it("should be able to get a playlist by id", () => {
    const make = makePlaylist({}, "1");

    repository.playlists.push(make.playlist);

    const { playlist } = sut.execute({ id: "1" });

    expect(playlist).toBeInstanceOf(Playlist);
    expect(playlist.id).toBe("1");
  });

  it("should throw an error if a playlist is not found", () => {
    expect(() => sut.execute({ id: "non-existent-id" })).toThrow(
      EntityNotFoundError,
    );
  });
});
