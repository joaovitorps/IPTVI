import { Playlist } from "@/shared/types";
import { create } from "zustand";

const initialState = {
  isCurrentPlaylist: 0,
  playlists: [],
  isAuthenticated: false,
  loading: false,
  error: false,
};

interface AuthState {
  isCurrentPlaylist: number;
  playlists: Playlist[];
  isAuthenticated: boolean;
  loading: boolean;
  error: boolean;
  setPlaylists: (playlists: Playlist[]) => void;
}

export const useAuthState = create<AuthState>()((set) => ({
  ...initialState,
  setPlaylists: (playlists) => set(() => ({ playlists: playlists || [] })),
}));
