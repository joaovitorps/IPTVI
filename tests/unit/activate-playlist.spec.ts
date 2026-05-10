import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Activate playlist use case", () => {
  let playlistRepo: InMemoryPlaylistRepository;
  let sut: ActivatePlaylistUseCase;

  beforeEach(() => {
    playlistRepo = new InMemoryPlaylistRepository();
    sut = new ActivatePlaylistUseCase(playlistRepo);
  });

  it("should be able to activate a playlist", async () => {
    const { playlist } = makePlaylist();

    playlistRepo.playlists.push(playlist);

    expect(playlist.isActive).toBe(false);

    await sut.execute({ playlistId: playlist.id });

    expect(playlist.isActive).toBe(true);
  });
});
