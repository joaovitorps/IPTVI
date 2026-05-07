import { store } from "../../../../shared/store";
import { Playlist } from "../../entities/playlist";
import { PlaylistRepository } from "../playlist-repository";

export class StorePlaylistRepository implements PlaylistRepository {
  create(playlist: Playlist): Playlist {
    store.appendToArray("playlists", playlist.toJSON());

    return playlist;
  }

  getPlaylist(id: string): Playlist | null {
    const playlists = store.get("playlists") || [];
    const playlistProps = playlists.find((p) => p.id === id);

    if (!playlistProps) return null;

    return Playlist.create(playlistProps);
  }

  updatePlaylist(id: string, playlist: Playlist): void {
    const playlists = store.get("playlists") || [];
    const newPlaylists = playlists.map((p) =>
      p.id === id ? playlist.toJSON() : p,
    );
    store.set("playlists", newPlaylists);
  }

  getActivePlaylist(): Playlist | null {
    const activeId = store.get("activePlaylistId");
    const playlists = store.get("playlists") || [];
    const playlistProps = playlists.find((p) => p.id === activeId);

    if (!playlistProps) return null;

    return Playlist.create(playlistProps);
  }

  fetchPlaylist(): Playlist[] {
    const playlists = store.get("playlists") || [];
    return playlists.map((p) => Playlist.create(p));
  }
}
