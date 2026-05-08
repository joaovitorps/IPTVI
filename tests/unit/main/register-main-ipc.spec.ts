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
  it("registers all expected IPC channels with correct handler contract", async () => {
    const handle = vi.fn();
    const validateCredentialsMock = vi.mocked(validateCredentials);
    const createPlaylistMock = vi.mocked(createPlaylist);
    const updatePlaylistMock = vi.mocked(updatePlaylist);
    const deletePlaylistMock = vi.mocked(deletePlaylist);
    const fetchCategoriesMock = vi.mocked(fetchCategories);
    const fetchSeriesMock = vi.mocked(fetchSeries);
    const fetchSerieInfoMock = vi.mocked(fetchSerieInfo);

    validateCredentialsMock.mockResolvedValue({ isValid: true, error: undefined });
    createPlaylistMock.mockReturnValue({} as never);
    updatePlaylistMock.mockReturnValue({} as never);
    deletePlaylistMock.mockReturnValue({} as never);
    fetchCategoriesMock.mockResolvedValue([]);
    fetchSeriesMock.mockResolvedValue([]);
    fetchSerieInfoMock.mockResolvedValue({} as never);

    registerMainIpc({ handle } as unknown as IpcMain);

    const channelHandlers = new Map<string, (...args: unknown[]) => unknown>(
      handle.mock.calls.map(([channel, handler]) => [channel as string, handler]),
    );

    expect(handle).toHaveBeenCalledTimes(8);
    expect(Array.from(channelHandlers.keys())).toEqual(
      expect.arrayContaining([
        "playlist:validate",
        "playlist:create",
        "playlist:fetch",
        "playlist:update",
        "playlist:delete",
        "get-series-categories",
        "get-series-category",
        "get-serie-info",
      ]),
    );
    expect(channelHandlers.get("playlist:fetch")).toBe(fetchPlaylists);

    const validateResult = await channelHandlers.get("playlist:validate")!(null, {
      server: "http://server",
      username: "user",
      password: "pass",
    });
    const createResult = channelHandlers.get("playlist:create")!(null, {
      name: "My Playlist",
      credentials: { server: "http://server", username: "user", password: "pass" },
    });
    const updateResult = channelHandlers.get("playlist:update")!(null, {
      playlistId: "playlist-id",
      data: { name: "Updated" },
    });
    const deleteResult = channelHandlers.get("playlist:delete")!(null, "playlist-id");
    const categoriesResult = await channelHandlers.get("get-series-categories")!(null);
    const seriesResult = await channelHandlers.get("get-series-category")!(null, 10);
    const serieInfoResult = await channelHandlers.get("get-serie-info")!(null, 20);

    expect(validateCredentialsMock).toHaveBeenCalledWith({
      server: "http://server",
      username: "user",
      password: "pass",
    });
    expect(validateResult).toEqual({ isValid: true });

    expect(createPlaylistMock).toHaveBeenCalledWith({
      name: "My Playlist",
      credentials: { server: "http://server", username: "user", password: "pass" },
    });
    expect(updatePlaylistMock).toHaveBeenCalledWith({
      playlistId: "playlist-id",
      data: { name: "Updated" },
    });
    expect(deletePlaylistMock).toHaveBeenCalledWith("playlist-id");
    expect(fetchCategoriesMock).toHaveBeenCalledTimes(1);
    expect(fetchSeriesMock).toHaveBeenCalledWith(10);
    expect(fetchSerieInfoMock).toHaveBeenCalledWith(20);

    expect(createResult).toBeUndefined();
    expect(updateResult).toBeUndefined();
    expect(deleteResult).toBeUndefined();
    expect(categoriesResult).toEqual([]);
    expect(seriesResult).toEqual([]);
    expect(serieInfoResult).toEqual({});
  });
});
