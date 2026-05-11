import { StopServerUseCase } from "@/core/domain/use-cases/server/stop-server";
import { InMemoryStreamServerRepository } from "@tests/repositories/in-memory-stream-server-repository";

describe("Stop server use case", () => {
  let streamServerRepository: InMemoryStreamServerRepository;
  let sut: StopServerUseCase;

  beforeEach(() => {
    streamServerRepository = new InMemoryStreamServerRepository();
    sut = new StopServerUseCase(streamServerRepository);
  });

  it("should stop server with provided reason", async () => {
    const result = await sut.execute({
      reason: "player-unmount",
    });

    expect(result.ok).toBe(true);
    expect(streamServerRepository.stopCalls).toBe(1);
    expect(streamServerRepository.stopParams).toEqual({
      reason: "player-unmount",
      force: false,
    });
  });
});
