import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { GetServerStatusUseCase } from "@/core/domain/use-cases/server/get-server-status";
import { StartServerUseCase } from "@/core/domain/use-cases/server/start-server";
import { StopServerUseCase } from "@/core/domain/use-cases/server/stop-server";
import { IPC } from "@/shared/constants/ipc";
import {
  StartStreamServerParams,
  StopStreamServerParams,
} from "@/shared/types/ipc";
import { IpcMain } from "electron";

import { StreamServerLifecycleManager } from "./lifecycle/stream-server-lifecycle-manager";

export const streamServerLifecycleManager = new StreamServerLifecycleManager();

export const streamServerLifecycleHandlers = (ipcMain: IpcMain) => {
  const startServerUseCase = new StartServerUseCase(
    new StorePlaylistRepository(),
    streamServerLifecycleManager,
  );

  const stopServerUseCase = new StopServerUseCase(streamServerLifecycleManager);

  const getServerStatusUseCase = new GetServerStatusUseCase(
    streamServerLifecycleManager,
  );

  ipcMain.handle(
    IPC.STREAM_SERVER.START,
    async (_event, params?: StartStreamServerParams) => {
      console.log("[stream-server] start requested");

      try {
        const { ok, status, error } = await startServerUseCase.execute({
          host: params?.host,
          port: params?.port,
        });

        if (ok) {
          console.log("[stream-server] start succeeded");
        } else {
          console.error(
            `[stream-server] start failed: ${error?.code} - ${error?.message}`,
          );
        }

        if (error) {
          return { ok, status, error };
        }

        return { ok, status };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Internal start error";

        console.error(`[stream-server] start error: ${message}`);

        return {
          ok: false,
          status: streamServerLifecycleManager.status(),
          error: { code: "INTERNAL" as const, message },
        };
      }
    },
  );

  ipcMain.handle(
    IPC.STREAM_SERVER.STOP,
    async (_event, params?: StopStreamServerParams) => {
      console.log("[stream-server] stop requested");

      try {
        const { ok, status, error } = await stopServerUseCase.execute({
          force: params?.force,
          reason: params?.reason,
        });

        if (ok) {
          console.log("[stream-server] stop succeeded");
        } else {
          console.error(
            `[stream-server] stop failed: ${error?.code} - ${error?.message}`,
          );
        }

        if (error) {
          return { ok, status, error };
        }

        return { ok, status };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Internal stop error";

        console.error(`[stream-server] stop error: ${message}`);

        return {
          ok: false,
          status: streamServerLifecycleManager.status(),
          error: { code: "INTERNAL" as const, message },
        };
      }
    },
  );

  ipcMain.handle(IPC.STREAM_SERVER.STATUS, () => {
    const { status } = getServerStatusUseCase.execute();

    return {
      ok: true,
      status,
    };
  });
};
