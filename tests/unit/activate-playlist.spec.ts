import { InvalidCredentialsError } from "@/core/domain/use-cases/error/invalid-credentials-error";
import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryAPIRepository } from "@tests/repositories/in-memory-credential-repository";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Activate playlist use case", () => {
  let playlistRepo: InMemoryPlaylistRepository;
  let credentialRepo: InMemoryAPIRepository;
  let sut: ActivatePlaylistUseCase;

  beforeEach(() => {
    playlistRepo = new InMemoryPlaylistRepository();
    credentialRepo = new InMemoryAPIRepository();
    sut = new ActivatePlaylistUseCase(playlistRepo, credentialRepo);
  });

  it("should be able to activate a playlist with valid credentials", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);

    expect(playlist.isActive).toBe(false);

    const result = await sut.execute({ playlistId: playlist.id });

    expect(result.activated).toBe(true);
    expect(playlist.isActive).toBe(true);
  });

  it("should throw InvalidCredentialsError when credentials are invalid", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);
    credentialRepo.isValid = false;
    credentialRepo.validationError = "Invalid Credentials.";

    await expect(
      sut.execute({ playlistId: playlist.id }),
    ).rejects.toThrow(InvalidCredentialsError);

    await expect(
      sut.execute({ playlistId: playlist.id }),
    ).rejects.toThrow("Invalid Credentials.");

    expect(playlist.isActive).toBe(false);
  });

  it("should throw InvalidCredentialsError with 'Invalid URL.' when host is unreachable", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);
    credentialRepo.isValid = false;
    credentialRepo.validationError = "Invalid URL.";

    await expect(
      sut.execute({ playlistId: playlist.id }),
    ).rejects.toThrow("Invalid URL.");

    expect(playlist.isActive).toBe(false);
  });

  it("should deactivate other playlists when activating a new one", async () => {
    const { playlist: activePlaylist } = makePlaylist();
    activePlaylist.isActive = true;
    playlistRepo.playlists.push(activePlaylist);

    const { playlist: newPlaylist } = makePlaylist();
    playlistRepo.playlists.push(newPlaylist);

    await sut.execute({ playlistId: newPlaylist.id });

    expect(activePlaylist.isActive).toBe(false);
    expect(newPlaylist.isActive).toBe(true);
  });

  it("should not deactivate the same playlist when it is already active", async () => {
    const { playlist } = makePlaylist();
    playlist.isActive = true;
    playlistRepo.playlists.push(playlist);

    const result = await sut.execute({ playlistId: playlist.id });

    expect(result.activated).toBe(true);
    expect(playlist.isActive).toBe(true);
  });
});
