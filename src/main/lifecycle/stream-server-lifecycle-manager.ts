import { fork, ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  StartStreamServerRepositoryParams,
  StreamServerRepository,
} from "@/core/domain/repositories/stream-server-repository";
import {
  StopStreamServerParams,
  StreamServerResult,
  StreamServerStatus,
  StreamServerState,
} from "@/shared/types/ipc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StreamServerLifecycleManager implements StreamServerRepository {
  private state: StreamServerState = "stopped";
  private child: ChildProcess | null = null;
  private currentStatus: StreamServerStatus = {
    state: "stopped",
    host: "127.0.0.1",
    port: 9876,
    baseUrl: "http://127.0.0.1:9876",
  };
  private operationLock: Promise<void> = Promise.resolve();
  private currentPlaylistId?: string;

  status(): StreamServerStatus {
    return { ...this.currentStatus };
  }

  async start(
    params: StartStreamServerRepositoryParams,
  ): Promise<StreamServerResult> {
    const lockRelease = await this.acquireLock();

    try {
      if (this.state === "running" || this.state === "starting") {
        return {
          ok: true,
          status: this.currentStatus,
        };
      }

      return this.startChild(params);
    } finally {
      lockRelease();
    }
  }

  async stop(
    params: StopStreamServerParams,
  ): Promise<StreamServerResult> {
    const lockRelease = await this.acquireLock();

    try {
      if (this.state === "stopped") {
        return {
          ok: true,
          status: this.currentStatus,
        };
      }

      return this.stopChild(params.force);
    } finally {
      lockRelease();
    }
  }

  private async acquireLock(): Promise<() => void> {
    let release: () => void;

    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });

    const previous = this.operationLock;
    this.operationLock = previous.then(() => wait);

    await previous;

    return release!;
  }

  private startChild(params: StartStreamServerRepositoryParams): Promise<StreamServerResult> {
    return new Promise((resolve) => {
      this.transition("starting");

      try {
        const childPath = path.join(__dirname, "streamParser.js");
        const child = fork(childPath, [], {
          stdio: "pipe",
          env: {
            ...process.env,
          },
        });

        this.child = child;

        child.stdout?.on("data", (data: Buffer) => {
          console.log(`[stream-server] ${data.toString().trim()}`);
        });

        child.stderr?.on("data", (data: Buffer) => {
          console.error(`[stream-server:err] ${data.toString().trim()}`);
        });

        const readyTimeout = setTimeout(() => {
          this.cleanupChild();
          this.transition("error");
          resolve({
            ok: false,
            status: this.currentStatus,
            error: {
              code: "START_TIMEOUT",
              message: "Server did not become ready within timeout.",
            },
          });
        }, 15000);

        child.on("message", (msg: unknown) => {
          const message = String(msg);

          if (message.startsWith("PID ")) {
            clearTimeout(readyTimeout);
            this.currentPlaylistId = params.playlistId;
            this.currentStatus = {
              ...this.currentStatus,
              state: "running",
              pid: child.pid ?? undefined,
              playlistId: params.playlistId,
              startedAt: new Date().toISOString(),
              lastError: undefined,
            };
            this.transition("running");

            child.send({ type: "credentials", ...params });

            resolve({
              ok: true,
              status: { ...this.currentStatus },
            });
          }
        });

        child.on("exit", (code, signal) => {
          this.child = null;
          const wasRunning = this.state === "running" || this.state === "starting";

          if (wasRunning) {
            console.error(
              `[stream-server] unexpected exit code=${code} signal=${signal}`,
            );
            this.transition("error");
            this.currentStatus = {
              ...this.currentStatus,
              state: "error",
              pid: undefined,
              playlistId: undefined,
              lastError: {
                code: "UNEXPECTED_EXIT",
                message: `Process exited with code ${code}, signal ${signal}`,
              },
            };
          } else {
            this.transition("stopped");
            this.currentStatus = {
              ...this.currentStatus,
              state: "stopped",
              pid: undefined,
              playlistId: undefined,
            };
          }
        });

        child.on("error", (err) => {
          console.error(`[stream-server] spawn error: ${err.message}`);
          this.transition("error");
          clearTimeout(readyTimeout);
          this.currentStatus = {
            ...this.currentStatus,
            state: "error",
            lastError: {
              code: "SPAWN_FAILED",
              message: err.message,
            },
          };

          resolve({
            ok: false,
            status: { ...this.currentStatus },
            error: {
              code: "SPAWN_FAILED",
              message: err.message,
            },
          });
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error during spawn";
        this.transition("error");
        this.currentStatus = {
          ...this.currentStatus,
          state: "error",
          lastError: {
            code: "SPAWN_FAILED",
            message,
          },
        };

        resolve({
          ok: false,
          status: { ...this.currentStatus },
          error: {
            code: "SPAWN_FAILED",
            message,
          },
        });
      }
    });
  }

  private stopChild(force?: boolean): Promise<StreamServerResult> {
    return new Promise((resolve) => {
      const child = this.child;

      if (!child) {
        this.transition("stopped");
        this.currentStatus = {
          ...this.currentStatus,
          state: "stopped",
          pid: undefined,
          playlistId: undefined,
        };

        resolve({
          ok: true,
          status: { ...this.currentStatus },
        });

        return;
      }

      this.transition("stopping");

      const killTimeout = setTimeout(() => {
        console.warn(
          "[stream-server] graceful stop timed out, force killing",
        );
        this.killChild(child);
        this.transition("stopped");
        this.currentStatus = {
          ...this.currentStatus,
          state: "stopped",
          pid: undefined,
          playlistId: undefined,
        };

        resolve({
          ok: true,
          status: { ...this.currentStatus },
        });
      }, force ? 0 : 10000);

      child.once("exit", () => {
        clearTimeout(killTimeout);
      });

      const shutdownTimeout = setTimeout(() => {
        if (child.connected) {
          child.disconnect();
        }
      }, 100);

      const forceKillTimeout = setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 5000);

      child.on("exit", () => {
        clearTimeout(shutdownTimeout);
        clearTimeout(forceKillTimeout);
        clearTimeout(killTimeout);
        this.child = null;
        this.currentPlaylistId = undefined;
        this.transition("stopped");
        this.currentStatus = {
          ...this.currentStatus,
          state: "stopped",
          pid: undefined,
          playlistId: undefined,
        };

        resolve({
          ok: true,
          status: { ...this.currentStatus },
        });
      });

      if (child.connected) {
        child.send({ type: "shutdown" });
      } else {
        child.kill("SIGTERM");
      }
    });
  }

  private killChild(child: ChildProcess): void {
    if (!child.killed) {
      try {
        child.kill("SIGKILL");
      } catch {
        // already dead
      }
    }
  }

  private cleanupChild(): void {
    if (this.child) {
      this.child.removeAllListeners();
      if (this.child.connected) {
        this.child.disconnect();
      }
      this.killChild(this.child);
      this.child = null;
    }
  }

  private transition(newState: StreamServerState): void {
    const from = this.state;
    this.state = newState;
    console.log(
      `[stream-server] state: ${from} -> ${newState}`,
    );
  }

  forceStop(): void {
    this.cleanupChild();
    this.transition("stopped");
    this.currentStatus = {
      ...this.currentStatus,
      state: "stopped",
      pid: undefined,
      playlistId: undefined,
    };
  }
}
