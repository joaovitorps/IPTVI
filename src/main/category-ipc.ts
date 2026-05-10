import { IPC } from "@/shared/constants/ipc";
import { IpcMain } from "electron";

import { fetchCategories } from "./handlers/fetch-categories";

export const categoryIpcHandlers = (ipcMain: IpcMain) => {
  ipcMain.handle(IPC.CATEGORY.FETCH, fetchCategories);
};
