import { IPC } from "@/shared/constants/ipc";
import type { StoreSchema } from "@/shared/store";
import {
  Api,
  CreatePlaylist,
  FetchPlaylistsReturn,
  Store,
  UpdatePlaylist,
} from "@/shared/types";
import { CategoryDTO, SerieDTO } from "@/shared/types/dto";
import {
  CreatePlaylistParams,
  ValidateParams,
  ValidateReturn,
} from "@/shared/types/ipc";
import { contextBridge, ipcRenderer } from "electron";

const api: Api = {
  playlist: {
    activate(playlistId: string): Promise<void> {
      return ipcRenderer.invoke(IPC.PLAYLIST.ACTIVATE, playlistId);
    },

    validate(params: ValidateParams): Promise<ValidateReturn> {
      return ipcRenderer.invoke(IPC.PLAYLIST.VALIDATE, params);
    },

    create(params: CreatePlaylistParams): Promise<CreatePlaylist> {
      return ipcRenderer.invoke(IPC.PLAYLIST.CREATE, params);
    },

    fetch(): Promise<FetchPlaylistsReturn> {
      return ipcRenderer.invoke(IPC.PLAYLIST.FETCH);
    },

    update(params: UpdatePlaylist) {
      return ipcRenderer.invoke(IPC.PLAYLIST.UPDATE, params);
    },

    delete(playlistId: string) {
      return ipcRenderer.invoke(IPC.PLAYLIST.DELETE, playlistId);
    },
  },

  category: {
    fetch(): Promise<CategoryDTO[]> {
      return ipcRenderer.invoke(IPC.CATEGORY.FETCH);
    },
  },
  serie: {
    getById(serieId: number): Promise<SerieDTO> {
      return ipcRenderer.invoke(IPC.SERIE.GET_BY_ID, serieId);
    },
    fetchByCategoryId(categoryId: number): Promise<SerieDTO[]> {
      return ipcRenderer.invoke(IPC.SERIE.FETCH_BY_CATEGORY_ID, categoryId);
    },
  },
};

const store: Store = {
  get(key: keyof StoreSchema): Promise<string> {
    return ipcRenderer.invoke(IPC.STORE.GET, key);
  },
  set(key: keyof StoreSchema, value: unknown): Promise<void> {
    return ipcRenderer.invoke(IPC.STORE.SET, key, value);
  },
};

contextBridge.exposeInMainWorld("api", api);
contextBridge.exposeInMainWorld("store", store);
