import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { Playlist } from "@/core/domain/entities/playlist";
import { describe, expect, it } from "vitest";

describe("Playlist Entity", () => {
  it("should be able to create a new playlist", () => {
    const playlist = Playlist.create({
      name: "Test Playlist",
      credentials: Credentials.create("http://test.com", "u", "p"),
      isActive: true,
    });

    expect(playlist).toBeInstanceOf(Playlist);
    expect(playlist.name).toBe("Test Playlist");
  });

  it("should be able to convert to JSON", () => {
    const playlist = Playlist.create({
      name: "Test Playlist",
      credentials: Credentials.create("http://test.com", "u", "p"),
      isActive: true,
    });
    const json = playlist.toJSON();

    expect(json).toMatchObject({
      name: "Test Playlist",
      isActive: true,
    });
  });
});
