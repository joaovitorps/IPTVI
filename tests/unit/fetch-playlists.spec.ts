import { FetchPlaylistsUseCase } from "@/core/domain/use-cases/playlist/fetch-playlists";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Fetch playlists use case", () => {
  let repository: InMemoryPlaylistRepository;
  let sut: FetchPlaylistsUseCase;

  beforeEach(() => {
    repository = new InMemoryPlaylistRepository();
    sut = new FetchPlaylistsUseCase(repository);
  });

  it("should be able to fetch all playlists", () => {
    const playlist = makePlaylist().playlist;
    const playlist2 = makePlaylist().playlist;

    repository.playlists.push(playlist, playlist2);

    const { playlists } = sut.execute();

    expect(playlists).toHaveLength(2);
    expect(playlists).toContain(playlist);
    expect(playlists).toContain(playlist2);
  });

  it("should return an empty array if there are no playlists", () => {
    const { playlists } = sut.execute();
    expect(playlists).toEqual([]);
  });
});
