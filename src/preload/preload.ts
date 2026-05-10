import { IPC } from "@/shared/constants/ipc";
import {
  CreatePlaylist,
  FetchPlaylistsReturn,
  UpdatePlaylist,
} from "@/shared/types";
import { CategoryDTO, SerieDTO } from "@/shared/types/dto";
import {
  CreatePlaylistParams,
  ValidateParams,
  ValidateReturn,
} from "@/shared/types/ipc";
import { contextBridge, ipcRenderer } from "electron";

const api = {
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

contextBridge.exposeInMainWorld(
  "api",
  api,
  // getSerieInfo: (serie_id: number) =>
  //   ipcRenderer.invoke("get-serie-info", serie_id),
);
