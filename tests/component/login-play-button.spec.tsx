/**
 * @vitest-environment happy-dom
 */

import { Login } from "@/renderer/pages/Login";
import { PlaylistDTO } from "@/shared/types";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "./setup";

function makePlaylistDTO(overwrite: Partial<PlaylistDTO> = {}): PlaylistDTO {
  return {
    id: "playlist-1",
    name: "Test Playlist",
    server: "http://example.com:8080",
    username: "user",
    password: "pass",
    isActive: false,
    createdAt: new Date(),
    ...overwrite,
  };
}

describe("Login Page - Play Button", () => {
  const mockPlaylist = makePlaylistDTO();

  it("should show error banner when activating playlist with invalid credentials", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api = {
      playlist: {
        activate: vi.fn().mockRejectedValue(new Error("Invalid Credentials.")),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([mockPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    });

    const playButton = screen.getByTitle("Play");
    expect(playButton).toBeInTheDocument();

    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid Credentials.")).toBeInTheDocument();
    });

    const errorBanner = screen
      .getByText("Invalid Credentials.")
      .closest("div");
    expect(errorBanner).toHaveClass("bg-red-500/10");
  });

  it("should redirect when activating playlist with valid credentials", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api = {
      playlist: {
        activate: vi.fn().mockResolvedValue(undefined),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([mockPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    let redirectedTo = "";
    const originalLocation = window.location;
    delete (window as Record<string, unknown>).location;
    window.location = {
      ...originalLocation,
      set href(value: string) {
        redirectedTo = value;
      },
      get href() {
        return redirectedTo;
      },
    } as Location;

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    });

    const playButton = screen.getByTitle("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(redirectedTo).toBe("/");
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).api.playlist.activate).toHaveBeenCalledWith(
      "playlist-1",
    );
  });

  it("should show confirmation dialog when another playlist is active", async () => {
    const activePlaylist = makePlaylistDTO({
      id: "active-1",
      name: "Active Playlist",
      isActive: true,
    });
    const newPlaylist = makePlaylistDTO({
      id: "new-1",
      name: "New Playlist",
      isActive: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api = {
      playlist: {
        activate: vi.fn().mockResolvedValue(undefined),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([activePlaylist, newPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByText("New Playlist")).toBeInTheDocument();
    });

    const playButtons = screen.getAllByTitle("Play");
    expect(playButtons).toHaveLength(2);

    fireEvent.click(playButtons[1]);

    await waitFor(() => {
      expect(
        screen.getByText("Switch Active Playlist"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Another playlist is currently active. Do you want to deactivate it and activate this one instead?",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Switch Playlist"));

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).api.playlist.activate).toHaveBeenCalledWith(
        "new-1",
      );
    });
  });
});
