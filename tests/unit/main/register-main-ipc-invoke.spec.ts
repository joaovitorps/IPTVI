import type { IpcMain } from "electron";
import { describe, expect, it, vi } from "vitest";

import { validateCredentials } from "@/main/handlers/validate-credentials";
import { registerMainIpc } from "@/main/ipc/register-main-ipc";

vi.mock("@/main/handlers/validate-credentials", () => ({
  validateCredentials: vi.fn(),
}));
vi.mock("@/main/handlers/create-playlist", () => ({ createPlaylist: vi.fn() }));
vi.mock("@/main/handlers/fetch-playlists", () => ({ fetchPlaylists: vi.fn() }));
vi.mock("@/main/handlers/update-playlist", () => ({ updatePlaylist: vi.fn() }));
vi.mock("@/main/handlers/delete-playlist", () => ({ deletePlaylist: vi.fn() }));
vi.mock("@/main/handlers/fetch-categories", () => ({ fetchCategories: vi.fn() }));
vi.mock("@/main/handlers/fetch-series", () => ({ fetchSeries: vi.fn() }));
vi.mock("@/main/handlers/fetch-serie-info", () => ({ fetchSerieInfo: vi.fn() }));

describe("registerMainIpc invoke handlers", () => {
  it("delegates playlist:validate payload and returns delegated result", async () => {
    const handle = vi.fn();
    const delegatedResult = { isValid: false, error: "Invalid credentials" };
    const validateCredentialsMock = vi.mocked(validateCredentials);

    validateCredentialsMock.mockResolvedValue(delegatedResult);

    registerMainIpc({ handle } as unknown as IpcMain);

    const channelHandlers = new Map<string, (...args: unknown[]) => unknown>(
      handle.mock.calls.map(([channel, handler]) => [channel as string, handler]),
    );

    const credentials = {
      server: "http://server",
      username: "user",
      password: "pass",
    };

    const playlistValidateHandler = channelHandlers.get("playlist:validate");

    expect(playlistValidateHandler).toBeTypeOf("function");

    if (!playlistValidateHandler) {
      throw new Error("Expected playlist:validate handler to be registered");
    }

    const result = await playlistValidateHandler(null, credentials);

    expect(validateCredentialsMock).toHaveBeenCalledTimes(1);
    expect(validateCredentialsMock).toHaveBeenCalledWith(credentials);
    expect(result).toEqual(delegatedResult);
  });
});
