import { Playlist } from "../entities/playlist";

export interface PlaylistRepository {
  create(playlist: Playlist): Playlist;
  getActivePlaylist(): Playlist | null;
  fetchPlaylist(): Playlist[];
  getPlaylist(id: string): Playlist | null;
  updatePlaylist(id: string, playlist: Playlist): void;
}
