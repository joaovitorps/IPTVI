import { IPC } from "@/shared/constants/ipc";
import type { IpcMain } from "electron";

import { fetchSeriesByCategoryId } from "./handlers/serie/fetch-series-by-category-id";

export const serieIpcHandlers = (ipcMain: IpcMain) => {
  ipcMain.handle(IPC.SERIE.GET_BY_ID, (_, serieId: number) => {
    return getSeriById(serieId);
  });

  ipcMain.handle(IPC.SERIE.FETCH_BY_CATEGORY_ID, (_, categoryId: number) => {
    return fetchSeriesByCategoryId(categoryId);
  });
};
