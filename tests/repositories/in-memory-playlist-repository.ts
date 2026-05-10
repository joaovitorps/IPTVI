/* eslint-disable @typescript-eslint/require-await */
import { Playlist } from "@/core/domain/entities/playlist";
import { PlaylistRepository } from "@/core/domain/repositories/playlist-repository";

export class InMemoryPlaylistRepository implements PlaylistRepository {
  public playlists: Playlist[] = [];
  public isValid = true;
  public validationError?: string;

  getById(id: string): Playlist | null {
    return this.playlists.find((p) => p.id === id) || null;
  }

  getByUsername(username: string): Playlist | null {
    const playlist = this.playlists.find(
      (playlist) => playlist.username === username,
    );

    if (!playlist) {
      return null;
    }

    return playlist;
  }
  fetchAll(): Playlist[] {
    return this.playlists;
  }

  async fetchActives() {
    const activePlaylists = this.playlists.filter(
      (playlist) => playlist.isActive === true,
    );

    return activePlaylists;
  }

  create(playlist: Playlist): Playlist {
    this.playlists.push(playlist);

    return playlist;
  }

  async save(playlist: Playlist) {
    const playlistIndex = this.playlists.findIndex((p) => p.id === playlist.id);

    if (playlistIndex !== -1) {
      this.playlists[playlistIndex] = playlist;
    }
  }

  delete(playlistId: string): void {
    this.playlists = this.playlists.filter(
      (playlist) => playlist.id !== playlistId,
    );
  }
}
