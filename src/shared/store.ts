import { Playlist } from "@/core/domain/entities/playlist";
import Store from "electron-store";

import { env } from "./env";

interface StoreSchema {
  playlists: Playlist[];
  playbackPositions: string;
}

export const store = new Store<StoreSchema>({
  // @ts-expect-error - projectName is required at runtime but types may be outdated
  projectName: "IPTV",
  encryptionKey: env.STORE_ENCRYPTION_KEY, // Simplified encryption for local storage
  defaults: {
    playlists: [],
    playbackPositions: "",
  },
});
