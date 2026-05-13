import {
  StartStreamServerRepositoryParams,
  StreamServerRepository,
} from "@/core/domain/repositories/stream-server-repository";
import {
  StopStreamServerParams,
  StreamServerResult,
  StreamServerStatus,
} from "@/shared/types/ipc";

export class InMemoryStreamServerRepository implements StreamServerRepository {
  public startCalls = 0;
  public stopCalls = 0;
  public startParams: StartStreamServerRepositoryParams | null = null;
  public stopParams: StopStreamServerParams | null = null;
  public currentStatus: StreamServerStatus = {
    state: "stopped",
    host: "127.0.0.1",
    port: 9876,
    baseUrl: "http://127.0.0.1:9876",
  };

  async start(
    params: StartStreamServerRepositoryParams,
  ): Promise<StreamServerResult> {
    this.startCalls += 1;
    this.startParams = params;
    this.currentStatus = {
      ...this.currentStatus,
      state: "running",
      pid: 123,
      playlistId: params.playlistId,
      hlsPlaylist: `/hls/${params.playlistId}/master.m3u8`,
      tracks: [
        { id: 0, type: "video", name: "720p", bitrate: 3000 },
        { id: 1, type: "video", name: "360p", bitrate: 1000 },
        { id: 2, type: "audio", name: "English", lang: "eng", default: true },
      ],
      startedAt: new Date().toISOString(),
    };

    return await Promise.resolve({
      ok: true,
      status: this.currentStatus,
    });
  }

  async stop(params: StopStreamServerParams): Promise<StreamServerResult> {
    this.stopCalls += 1;
    this.stopParams = params;
    this.currentStatus = {
      ...this.currentStatus,
      state: "stopped",
      pid: undefined,
      playlistId: undefined,
    };

    return await Promise.resolve({
      ok: true,
      status: this.currentStatus,
    });
  }

  status(): StreamServerStatus {
    return this.currentStatus;
  }
}
