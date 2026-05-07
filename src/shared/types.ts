import { Category } from "@/core/domain/entities/category";
import { Playlist, PlaylistProps } from "@/core/domain/entities/playlist";

import { Serie, SerieInfo } from "./schemas";
import { AppendToArrayFn, StoreSchema } from "./store";

export interface Credentials {
  server: string;
  username: string;
  password: string;
}

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

export interface CreatePlaylist {
  name: string;
  credentials: Credentials;
}

declare global {
  interface Window {
    api: {
      getSeriesCategories: () => Promise<Category[]>;
      getSeriesCategory: (categoryId: number) => Promise<Serie[]>;
      getSerieInfo: (serieId: number) => Promise<SerieInfo>;
    };
    authAPI: {
      validateCredentials: (
        credentials: Credentials,
      ) => Promise<{ ok: boolean; status: number; data: unknown }>;
      getCredentials: () => Promise<string>;
      saveCredentials: (credentials: Credentials) => void;
    };
    electron: {
      playlist: {
        create: ({ name, credentials }: CreatePlaylist) => Playlist;
      };
      store: {
        get: <K extends keyof StoreSchema>(key: K) => StoreSchema[K];
        getPlaylists: () => Playlist[];
        set: <K extends keyof StoreSchema>(
          key: K,
          value: StoreSchema[K],
        ) => void;
        clear: () => void;
        appendToArray: AppendToArrayFn;
      };
    };
  }
}
