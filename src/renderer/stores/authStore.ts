import { PlaylistDTO } from "@/shared/types";
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
  playlists: PlaylistDTO[];
  isAuthenticated: boolean;
  loading: boolean;
  error: boolean;

  fetchPlaylists: () => Promise<void>;
  redirect: () => void;
}

export const useAuthState = create<AuthState>()((set) => ({
  ...initialState,

  fetchPlaylists: async () => {
    try {
      set({ loading: true });
      const playlists = await window.api.playlist.fetch();
      console.log(playlists);
      set({ playlists: playlists || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      set({ error: true, loading: false });
    }
  },
  redirect: () => {
    set({ loading: true });
    window.location.href = "/";
  },
}));
