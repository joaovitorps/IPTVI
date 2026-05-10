import { Playlist } from "../entities/playlist";

export interface PlaylistRepository {
  getById(id: string): Playlist | null;
  getByUsername(username: string): Playlist | null;
  fetchAll(): Playlist[];
  fetchActives(): Promise<Playlist[]>;
  create(playlist: Playlist): Playlist;
  save(playlist: Playlist): Promise<void>;
  delete(playlistId: string): void;
}
