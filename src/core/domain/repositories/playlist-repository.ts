import { Playlist } from "../entities/playlist";

export interface PlaylistRepository {
  getById(id: string): Playlist | null;
  getByUsername(username: string): Playlist | null;
  fetchAll(): Playlist[];
  fetchActives(): Playlist[];
  create(playlist: Playlist): Playlist;
  update(id: string, data: Playlist): Playlist | false;
  delete(playlistId: string): void;
}
