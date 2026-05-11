import { Playlist } from "@/core/domain/entities/playlist";
import { FetchActivePlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-active-playlists";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Get active playlist use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: FetchActivePlaylistsUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new FetchActivePlaylistsUseCase(repository);
  });

  it("should be able to get the active playlist", async () => {
    const { playlist } = makePlaylist({ isActive: true });

    repository.playlists.push(playlist);

    const { playlists } = await sut.execute();

    expect(playlists[0]).toBeInstanceOf(Playlist);
    expect(playlists[0].isActive).toBe(true);
  });

  it("should return empty array if there is no active playlist", async () => {
    const { playlists } = await sut.execute();

    expect(playlists).toHaveLength(0);
  });
});
