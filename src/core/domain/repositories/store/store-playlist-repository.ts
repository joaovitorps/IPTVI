/* eslint-disable @typescript-eslint/require-await */
import { store } from "../../../../shared/store";
import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../playlist-repository";

export class StorePlaylistRepository implements PlaylistRepository {
  private playlists: Playlist[] = store.get("playlists") || [];

  fetchAll(): Playlist[] {
    return this.playlists;
  }

  async fetchActives() {
    const playlists = this.playlists.filter((p) => p.isActive === true);

    return playlists;
  }

  getByUsername(username: string): Playlist | null {
    if (this.playlists.length === 0) return null;

    const playlistWithUsername = this.playlists.find(
      (playlist) => playlist.username === username,
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

  async save(playlist: Playlist) {
    const index = this.playlists.findIndex(
      (playlist) => playlist.id === playlist.id,
    );

    if (index !== -1) {
      this.playlists[index] = playlist;

      store.set(
        "playlists",
        this.playlists.map((playlist) =>
          playlist instanceof Playlist ? playlist.toJSON() : playlist,
        ),
      );
    }
  }

  delete(playlistId: string) {
    const newPlaylists = this.playlists.filter(
      (playlist) => playlist.id !== playlistId,
    );

    store.set("playlists", newPlaylists);
  }
}
