import { StreamServerRepository } from "../../repositories/stream-server-repository";
import { StopStreamServerParams, StreamServerError } from "@/shared/types/ipc";

interface StopServerUseCaseParams {
  force?: boolean;
  reason?: string;
}

interface StopServerUseCaseReturn {
  ok: boolean;
  status: ReturnType<StreamServerRepository["status"]>;
  error?: StreamServerError;
}

export class StopServerUseCase {
  constructor(private readonly streamServerRepository: StreamServerRepository) {}

  async execute({
    force = false,
    reason,
  }: StopServerUseCaseParams): Promise<StopServerUseCaseReturn> {
    const params: StopStreamServerParams = {
      force,
      reason,
    };

    const result = await this.streamServerRepository.stop(params);

    if (result.ok) {
      return {
        ok: true,
        status: result.status,
      };
    }

    return {
      ok: false,
      status: result.status,
      error: result.error,
    };
  }
}
