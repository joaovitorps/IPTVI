import { Playlist } from "@/core/domain/entities/playlist";
import ElectronStore from "electron-store";

import { env } from "./env";

export interface StoreSchema {
  playlists: Playlist[];
  playbackPositions: string;
}

export type AppendToArrayFn = <K extends keyof StoreSchema>(
  key: K,
  value: StoreSchema[K] extends (infer U)[] ? U : never,
) => void;

class AppStore extends ElectronStore<StoreSchema> {
  appendToArray: AppendToArrayFn = (key, value) => {
    const arr = (this.get(key) as unknown[]) || [];
    this.set(key, [...arr, value] as StoreSchema[keyof StoreSchema]);
  };
}

export const store = new AppStore({
  // @ts-expect-error - projectName is required at runtime but types may be outdated
  projectName: "IPTV",
  encryptionKey: env.STORE_ENCRYPTION_KEY, // Simplified encryption for local storage
  defaults: {
    playlists: [],
    playbackPositions: "",
  },
});
