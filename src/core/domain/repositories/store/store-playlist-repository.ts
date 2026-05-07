import { store } from "../../../../shared/store";
import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../playlist-repository";

export class StorePlaylistRepository implements PlaylistRepository {
  private playlists: Playlist[] = store.get("playlists") || [];

  fetchAll(): Playlist[] {
    return this.playlists;
  }

  fetchActives(): Playlist[] {
    const playlists = this.playlists.filter((p) => p.isActive === true);

    return playlists;
  }

  getByUsername(username: string): Playlist | null {
    if (this.playlists.length === 0) return null;

    const playlistWithUsername = this.playlists.find(
      (playlist) => playlist.credentials.username === username,
    );

    if (!playlistWithUsername) {
      return null;
    }

    return playlistWithUsername;
  }

  getById(id: string): Playlist | null {
    const playlist = this.playlists.find((p) => p.id === id);

    if (!playlist) return null;

    return playlist;
  }

  create(playlist: Playlist): Playlist {
    store.appendToArray("playlists", playlist);

    return playlist;
  }

  update(id: string, data: Playlist): Playlist | false {
    const index = this.playlists.findIndex((playlist) => playlist.id === id);

    if (index === -1) {
      return false;
    }

    this.playlists[index] = data;

    store.set(
      "playlists",
      this.playlists.map((playlist) =>
        playlist instanceof Playlist ? playlist.toJSON() : playlist,
      ),
    );

    return data;
  }

  delete(playlistId: string) {
    const newPlaylists = this.playlists.filter(
      (playlist) => playlist.id !== playlistId,
    );

    store.set("playlists", newPlaylists);
  }
}
