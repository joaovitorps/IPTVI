import type { StoreSchema } from "@/shared/store";

import { CategoryDTO, SerieDTO } from "./types/dto";
import {
  StartStreamServerParams,
  StopStreamServerParams,
  StreamServerResult,
  ValidateParams,
  ValidateReturn,
} from "./types/ipc";

export interface StreamTrack {
  index: number;
  type: "video" | "audio" | "subtitle";
  codec: string;
  language: string;
  label: string;
}

export interface StreamMetadata {
  streamId: string;
  duration: number;
  tracks: StreamTrack[];
}

export interface RemuxProgress {
  status: "idle" | "downloading" | "remuxing" | "ready" | "error";
  progress: number;
  message: string;
}

export interface CreatePlaylistData {
  name: string;
  server: string;
  username: string;
  password: string;
}

export interface Credentials {
  server: string;
  username: string;
  password: string;
}

export interface UpdatePlaylist {
  playlistId: string;
  data: {
    name?: string;
    server?: string;
    username?: string;
    password?: string;
    isActive?: boolean;
  };
}

declare global {
  interface Window {
    api: Api;
    store: Store;
  }
}

export interface Api {
  playlist: {
    activate: (playlistId: string) => Promise<void>;
    validate: (params: ValidateParams) => Promise<ValidateReturn>;
    fetch: () => Promise<PlaylistDTO[]>;
    create: ({
      name,
      server,
      username,
      password,
    }: CreatePlaylistData) => Promise<PlaylistDTO>;
    update: ({ playlistId, data }: UpdatePlaylist) => Promise<PlaylistDTO | false>;
    delete: (playlistId: string) => Promise<void>;
  };
  category: {
    fetch: () => Promise<CategoryDTO[]>;
  };
  serie: {
    getById: (serieId: number) => Promise<SerieDTO>;
    fetchByCategoryId: (categoryId: number) => Promise<SerieDTO[]>;
  };
  streamServer: {
    start: (params?: StartStreamServerParams) => Promise<StreamServerResult>;
    stop: (params?: StopStreamServerParams) => Promise<StreamServerResult>;
    status: () => Promise<StreamServerResult>;
  };
}
export interface Store {
  get: <K extends keyof StoreSchema>(key: K) => Promise<string>;
  set: <K extends keyof StoreSchema>(
    key: K,
    value: StoreSchema[K],
  ) => Promise<void>;
}

export interface PlaylistDTO {
  id: string;
  name: string;
  server: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
