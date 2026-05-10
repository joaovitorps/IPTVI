import { Playlist } from "@/core/domain/entities/playlist";
import { describe, expect, it } from "vitest";

import { makePlaylist } from "../factories/make-playlist";

describe("Playlist Entity", () => {
  it("should be able to create a new playlist", () => {
    const { playlist } = makePlaylist();

    expect(playlist).toBeInstanceOf(Playlist);
    expect(playlist.name).toBe(playlist.name);
    expect(playlist.isActive).toBe(false);
  });

  it("should be able to convert to JSON", () => {
    const { playlist } = makePlaylist();

    const json = playlist.toJSON();

    expect(json).toMatchObject({
      name: playlist.name,
    });
  });
});
