import type { IpcMain } from "electron";
import { describe, expect, it, vi } from "vitest";

import { deletePlaylist } from "@/main/handlers/delete-playlist";
import { createPlaylist } from "@/main/handlers/create-playlist";
import { fetchCategories } from "@/main/handlers/fetch-categories";
import { fetchPlaylists } from "@/main/handlers/fetch-playlists";
import { fetchSerieInfo } from "@/main/handlers/fetch-serie-info";
import { fetchSeries } from "@/main/handlers/fetch-series";
import { updatePlaylist } from "@/main/handlers/update-playlist";
import { validateCredentials } from "@/main/handlers/validate-credentials";
import { registerMainIpc } from "@/main/ipc/register-main-ipc";

vi.mock("@/main/handlers/validate-credentials", () => ({
  validateCredentials: vi.fn(),
}));

vi.mock("@/main/handlers/create-playlist", () => ({
  createPlaylist: vi.fn(),
}));

vi.mock("@/main/handlers/fetch-playlists", () => ({
  fetchPlaylists: vi.fn(),
}));

vi.mock("@/main/handlers/update-playlist", () => ({
  updatePlaylist: vi.fn(),
}));

vi.mock("@/main/handlers/delete-playlist", () => ({
  deletePlaylist: vi.fn(),
}));

vi.mock("@/main/handlers/fetch-categories", () => ({
  fetchCategories: vi.fn(),
}));

vi.mock("@/main/handlers/fetch-series", () => ({
  fetchSeries: vi.fn(),
}));

vi.mock("@/main/handlers/fetch-serie-info", () => ({
  fetchSerieInfo: vi.fn(),
}));

describe("registerMainIpc", () => {
  it("registers all expected IPC channels", () => {
    const handle = vi.fn();

    registerMainIpc({ handle } as unknown as IpcMain);

    expect(handle).toHaveBeenCalledTimes(8);
    expect(handle).toHaveBeenNthCalledWith(1, "playlist:validate", expect.any(Function));
    expect(handle).toHaveBeenNthCalledWith(2, "playlist:create", expect.any(Function));
    expect(handle).toHaveBeenNthCalledWith(3, "playlist:fetch", fetchPlaylists);
    expect(handle).toHaveBeenNthCalledWith(4, "playlist:update", expect.any(Function));
    expect(handle).toHaveBeenNthCalledWith(5, "playlist:delete", expect.any(Function));
    expect(handle).toHaveBeenNthCalledWith(
      6,
      "get-series-categories",
      expect.any(Function),
    );
    expect(handle).toHaveBeenNthCalledWith(
      7,
      "get-series-category",
      expect.any(Function),
    );
    expect(handle).toHaveBeenNthCalledWith(8, "get-serie-info", expect.any(Function));

    expect(validateCredentials).toBeTypeOf("function");
    expect(createPlaylist).toBeTypeOf("function");
    expect(updatePlaylist).toBeTypeOf("function");
    expect(deletePlaylist).toBeTypeOf("function");
    expect(fetchCategories).toBeTypeOf("function");
    expect(fetchSeries).toBeTypeOf("function");
    expect(fetchSerieInfo).toBeTypeOf("function");
  });

  it("keeps playlist mutation handlers without return payload", () => {
    const handle = vi.fn();
    const createPlaylistMock = vi.mocked(createPlaylist);
    const updatePlaylistMock = vi.mocked(updatePlaylist);

    createPlaylistMock.mockReturnValue({} as never);
    updatePlaylistMock.mockReturnValue({} as never);

    registerMainIpc({ handle } as unknown as IpcMain);

    const createHandler = handle.mock.calls.find(
      ([channel]) => channel === "playlist:create",
    )?.[1] as (_event: unknown, payload: unknown) => unknown;
    const updateHandler = handle.mock.calls.find(
      ([channel]) => channel === "playlist:update",
    )?.[1] as (_event: unknown, payload: unknown) => unknown;

    const createResult = createHandler(null, {
      name: "My Playlist",
      credentials: { server: "http://server", username: "user", password: "pass" },
    });

    const updateResult = updateHandler(null, {
      playlistId: "playlist-id",
      data: { name: "Updated" },
    });

    expect(createPlaylistMock).toHaveBeenCalledWith({
      name: "My Playlist",
      credentials: { server: "http://server", username: "user", password: "pass" },
    });
    expect(updatePlaylistMock).toHaveBeenCalledWith({
      playlistId: "playlist-id",
      data: { name: "Updated" },
    });
    expect(createResult).toBeUndefined();
    expect(updateResult).toBeUndefined();
  });
});
