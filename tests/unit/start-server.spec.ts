import { Playlist } from "@/core/domain/entities/playlist";
import { StartServerUseCase } from "@/core/domain/use-cases/server/start-server";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";
import { InMemoryStreamServerRepository } from "@tests/repositories/in-memory-stream-server-repository";

describe("Start server use case", () => {
  let playlistRepository: InMemoryPlaylistRepository;
  let streamServerRepository: InMemoryStreamServerRepository;
  let sut: StartServerUseCase;

  beforeEach(() => {
    playlistRepository = new InMemoryPlaylistRepository();
    streamServerRepository = new InMemoryStreamServerRepository();
    sut = new StartServerUseCase(playlistRepository, streamServerRepository);
  });

  it("should return error when there is no active playlist", async () => {
    const result = await sut.execute({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NO_ACTIVE_PLAYLIST");
    }
  });

  it("should start server with active playlist credentials", async () => {
    const playlist = Playlist.create({
      name: "Main",
      server: "server.test",
      username: "u",
      password: "p",
      isActive: true,
    });

    playlistRepository.playlists.push(playlist);

    const result = await sut.execute({
      host: "127.0.0.1",
      port: 9876,
    });

    expect(result.ok).toBe(true);
    expect(streamServerRepository.startCalls).toBe(1);
    expect(streamServerRepository.startParams).toEqual({
      playlistId: playlist.id,
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
      host: "127.0.0.1",
      port: 9876,
    });
  });
});
