import type { IpcMain } from "electron";

import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { CreatePlaylist, UpdatePlaylist } from "@/shared/types";

import { createPlaylist } from "../handlers/create-playlist";
import { deletePlaylist } from "../handlers/delete-playlist";
import { fetchCategories } from "../handlers/fetch-categories";
import { fetchPlaylists } from "../handlers/fetch-playlists";
import { fetchSerieInfo } from "../handlers/fetch-serie-info";
import { fetchSeries } from "../handlers/fetch-series";
import { updatePlaylist } from "../handlers/update-playlist";
import { validateCredentials } from "../handlers/validate-credentials";

export const registerMainIpc = (ipcMain: IpcMain) => {
  ipcMain.handle("playlist:validate", (_event, credentials: Credentials) =>
    validateCredentials(credentials),
  );

  ipcMain.handle("playlist:create", (_event, { name, credentials }: CreatePlaylist) => {
    return createPlaylist({ name, credentials });
  });

  ipcMain.handle("playlist:fetch", fetchPlaylists);

  ipcMain.handle("playlist:update", (_event, { playlistId, data }: UpdatePlaylist) => {
    return updatePlaylist({ playlistId, data });
  });

  ipcMain.handle("playlist:delete", (_event, playlistId: string) => {
    return deletePlaylist(playlistId);
  });

  ipcMain.handle("get-series-categories", async () => {
    return fetchCategories();
  });

  ipcMain.handle("get-series-category", (_event, categoryId: number) => {
    return fetchSeries(categoryId);
  });

  ipcMain.handle("get-serie-info", (_event, serieId: number) => {
    return fetchSerieInfo(serieId);
  });
};
