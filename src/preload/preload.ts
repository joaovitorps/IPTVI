import { AppendToArrayFn } from "@/shared/store";
import { Credentials } from "@/shared/types";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getPlaylistContent: () => ipcRenderer.invoke("get-playlist-content"),
  getSeriesCategories: () => ipcRenderer.invoke("get-series-categories"),
  getSeriesCategory: (category_id: number) =>
    ipcRenderer.invoke("get-series-category", category_id),
  getSerieInfo: (serie_id: number) =>
    ipcRenderer.invoke("get-serie-info", serie_id),
});

contextBridge.exposeInMainWorld("authAPI", {
  validateCredentials: (credentials: Credentials) =>
    ipcRenderer.invoke("auth:validate", credentials),
});

contextBridge.exposeInMainWorld("electron", {
  store: {
    get: (key: string) => ipcRenderer.send("electron-store:get", key),
    getPlaylists: () => ipcRenderer.send("electron-store:get-playlists"),
    set: (key: string, value: string) =>
      ipcRenderer.send("electron-store:set", key, value),
    clear: () => ipcRenderer.send("electron-store:clear"),
    appendToArray: ((key, value) =>
      ipcRenderer.send("electron-store:append", key, value)) as AppendToArrayFn,
  },
});
