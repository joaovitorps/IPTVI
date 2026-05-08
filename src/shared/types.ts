import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { Playlist } from "@/core/domain/entities/playlist";
import { Category } from "@/core/domain/entities/series/category";

import { Serie, SerieInfo } from "./schemas";

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

export interface UpdatePlaylist {
  playlistId: string;
  data: Partial<Pick<Playlist, "name" | "credentials" | "isActive">>;
}

declare global {
  interface Window {
    api: {
      getSeriesCategories: () => Promise<Category[]>;
      getSeriesCategory: (categoryId: number) => Promise<Serie[]>;
      getSerieInfo: (serieId: number) => Promise<SerieInfo>;
      playlist: {
        validate: (
          credentials: Credentials,
        ) => Promise<{ isValid: true } | { isValid: false; error: string }>;
        fetch: () => Promise<Playlist[]>;
        create: ({ name, credentials }: CreatePlaylist) => Promise<Playlist>;
        update: ({ playlistId, data }: UpdatePlaylist) => Playlist | false;
        delete: (playlistId: string) => Promise<void>;
      };
    };
  }
}
