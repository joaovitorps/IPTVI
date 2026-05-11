import { IPC } from "@/shared/constants/ipc";
import { store } from "@/shared/store";
import type { StoreSchema } from "@/shared/store";
import { IpcMain } from "electron";

export const storeIpcHandlers = (ipcMain: IpcMain) => {
  ipcMain.handle(IPC.STORE.GET, (_, key: string) => {
    store.get(key);
  });

  ipcMain.handle(IPC.STORE.SET, (_, key: keyof StoreSchema, value: unknown) => {
    store.set(key, value);
  });
};
