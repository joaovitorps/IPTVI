import { StreamServerRepository } from "../../repositories/stream-server-repository";

interface GetServerStatusUseCaseReturn {
  status: ReturnType<StreamServerRepository["status"]>;
}

export class GetServerStatusUseCase {
  constructor(
    private readonly streamServerRepository: StreamServerRepository,
  ) {}

  execute(): GetServerStatusUseCaseReturn {
    const status = this.streamServerRepository.status();

    return { status };
  }
}
