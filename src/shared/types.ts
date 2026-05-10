import { Playlist } from "@/core/domain/entities/playlist";
import { Category } from "@/core/domain/entities/series/category";

import { Serie, SerieInfo } from "./schemas";
import { ValidateParams, ValidateReturn } from "./types/ipc";

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
  server: string;
  username: string;
  password: string;
}
export interface FetchPlaylistsReturn {
  playlists: Playlist[];
}

export interface Credentials {
  server: string;
  username: string;
  password: string;
}

export interface UpdatePlaylist {
  playlistId: string;
  data: Partial<
    Pick<Playlist, "name" | "server" | "username" | "password" | "isActive">
  >;
}

declare global {
  interface Window {
    api: {
      getSeriesCategory: (categoryId: number) => Promise<Serie[]>;
      getSerieInfo: (serieId: number) => Promise<SerieInfo>;
      playlist: {
        activate: (playlistId: string) => Promise<void>;
        validate: (params: ValidateParams) => Promise<ValidateReturn>;
        fetch: () => Promise<Playlist[]>;
        create: ({
          name,
          server,
          username,
          password,
        }: CreatePlaylist) => Promise<Playlist>;
        update: ({ playlistId, data }: UpdatePlaylist) => Playlist | false;
        delete: (playlistId: string) => Promise<void>;
      };
      category: {
        fetch: () => Promise<Category[]>;
      };
    };
  }
}
