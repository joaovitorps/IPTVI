import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { Playlist } from "@/core/domain/entities/playlist";
import { CreatePlaylist } from "@/shared/types";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getSeriesCategories: () => ipcRenderer.invoke("get-series-categories"),
  getSeriesCategory: (category_id: number) =>
    ipcRenderer.invoke("get-series-category", category_id),
  getSerieInfo: (serie_id: number) =>
    ipcRenderer.invoke("get-serie-info", serie_id),
  playlist: {
    validate: (credentials: Credentials) =>
      ipcRenderer.invoke("playlist:validate", credentials),

    fetch: () => ipcRenderer.invoke("playlist:fetch"),

    create: ({ name, credentials }: CreatePlaylist) =>
      ipcRenderer.invoke("playlist:create", { name, credentials }),

    update: (playlistId: string, data: Playlist) =>
      ipcRenderer.invoke("playlist:update", playlistId, data),

    delete: (playlistId: string) =>
      ipcRenderer.invoke("playlist:delete", playlistId),
  },
});
