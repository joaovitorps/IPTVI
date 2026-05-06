import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../playlist-repository";

export class InMemoryPlaylistRepository implements PlaylistRepository {
  public playlists: Playlist[] = [];
  public activePlaylistId: string | null = null;

  getActivePlaylist(): Playlist | null {
    if (!this.activePlaylistId) return null;
    return this.playlists.find((p) => p.id === this.activePlaylistId) || null;
  }
  fetchPlaylist(): Playlist[] {
    return this.playlists;
  }
  createPlaylist(playlist: Playlist): void {
    this.playlists.push(playlist);
  }
  getPlaylist(id: string): Playlist | null {
    return this.playlists.find((p) => p.id === id) || null;
  }
  updatePlaylist(id: string, playlist: Playlist): void {
    const index = this.playlists.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.playlists[index] = playlist;
    }
  }
}
