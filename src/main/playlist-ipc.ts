import { IPC } from "@/shared/constants/ipc";
import { UpdatePlaylist } from "@/shared/types";
import type { CreatePlaylistParams, ValidateParams } from "@/shared/types/ipc";
import type { IpcMain } from "electron";

import { activatePlaylist } from "./handlers/activate-playlist";
import { createPlaylist } from "./handlers/create-playlist";
import { deletePlaylist } from "./handlers/delete-playlist";
import { fetchPlaylists } from "./handlers/fetch-playlists";
import { updatePlaylist } from "./handlers/update-playlist";
import { validateCredentials } from "./handlers/validate-credentials";

export const playlistIpcHandlers = (ipcMain: IpcMain) => {
  ipcMain.handle(IPC.PLAYLIST.ACTIVATE, async (_, playlistId: string) => {
    return activatePlaylist(playlistId);
  });

  ipcMain.handle(IPC.PLAYLIST.VALIDATE, async (_, params: ValidateParams) => {
    return validateCredentials(params);
  });

  ipcMain.handle(
    IPC.PLAYLIST.CREATE,
    async (_, params: CreatePlaylistParams) => {
      return createPlaylist(params);
    },
  );

  ipcMain.handle(IPC.PLAYLIST.FETCH, fetchPlaylists);

  ipcMain.handle(IPC.PLAYLIST.UPDATE, async (_, params: UpdatePlaylist) => {
    return updatePlaylist(params);
  });

  ipcMain.handle(IPC.PLAYLIST.DELETE, (_, playlistId: string) => {
    return deletePlaylist(playlistId);
  });
};
