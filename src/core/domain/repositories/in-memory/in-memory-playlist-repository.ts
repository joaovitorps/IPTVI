import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../playlist-repository";

export class InMemoryPlaylistRepository implements PlaylistRepository {
  public playlists: Playlist[] = [];
  public isValid = true;
  public validationError?: string;

  getById(id: string): Playlist | null {
    return this.playlists.find((p) => p.id === id) || null;
  }

  getByUsername(username: string): Playlist | null {
    const playlist = this.playlists.find(
      (playlist) => playlist.credentials.username === username,
    );

    if (!playlist) {
      return null;
    }

    return playlist;
  }
  fetchAll(): Playlist[] {
    return this.playlists;
  }

  fetchActives(): Playlist[] {
    const activePlaylists = this.playlists.filter(
      (playlist) => playlist.isActive === true,
    );

    return activePlaylists;
  }

  create(playlist: Playlist): Playlist {
    this.playlists.push(playlist);

    return playlist;
  }

  update(id: string, playlist: Playlist): void {
    const index = this.playlists.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.playlists[index] = playlist;
    }
  }
}
