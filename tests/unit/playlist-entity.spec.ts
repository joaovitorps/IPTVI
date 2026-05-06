import { Playlist } from "@/core/domain/entities/playlist";
import { describe, expect, it } from "vitest";

describe("Playlist Entity", () => {
  it("should be able to create a new playlist", () => {
    const props = {
      id: "1",
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    const playlist = Playlist.create(props);

    expect(playlist).toBeInstanceOf(Playlist);
    expect(playlist.id).toBe("1");
    expect(playlist.name).toBe("Test Playlist");
  });

  it("should be able to convert to JSON", () => {
    const props = {
      id: "1",
      name: "Test Playlist",
      credentials: { server: "http://test.com", username: "u", password: "p" },
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    const playlist = Playlist.create(props);
    const json = playlist.toJSON();

    expect(json).toEqual(props);
  });
});
