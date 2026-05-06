import { Playlist } from "../entities/playlist";

export interface PlaylistRepository {
  getActivePlaylist(): Playlist | null;
  fetchPlaylist(): Playlist[];
  createPlaylist(playlist: Playlist): void;
  getPlaylist(id: string): Playlist | null;
  updatePlaylist(id: string, playlist: Playlist): void;
}
