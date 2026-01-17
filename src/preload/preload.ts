import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getPlaylistContent: async () => ipcRenderer.invoke("get-playlist-content"),
  getSeriesCategories: async () => ipcRenderer.invoke("get-series-categories"),
  getSeriesCategory: async (category_id: number) =>
    ipcRenderer.invoke("get-series-category", category_id),
});
