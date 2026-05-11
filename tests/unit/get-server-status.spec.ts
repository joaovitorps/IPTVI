import { GetServerStatusUseCase } from "@/core/domain/use-cases/server/get-server-status";
import { InMemoryStreamServerRepository } from "@tests/repositories/in-memory-stream-server-repository";

describe("Get server status use case", () => {
  let streamServerRepository: InMemoryStreamServerRepository;
  let sut: GetServerStatusUseCase;

  beforeEach(() => {
    streamServerRepository = new InMemoryStreamServerRepository();
    sut = new GetServerStatusUseCase(streamServerRepository);
  });

  it("should return current stream server status", () => {
    const result = sut.execute();

    expect(result.status.state).toBe("stopped");
    expect(result.status.baseUrl).toBe("http://127.0.0.1:9876");
  });
});
