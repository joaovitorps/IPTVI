import { Playlist } from "@/shared/types";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const playlists = window.electron.store.getPlaylists();

      const activePlaylistId = window.electron.store.get(
        "activePlaylistId",
      ) as string;

      if (!activePlaylistId || !playlists || playlists.length === 0) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      const activePlaylist = playlists.find(
        (p: Playlist) => p.id === activePlaylistId,
      );
      if (!activePlaylist) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // Validate credentials on startup as per plan
      try {
        const result = await window.authAPI.validateCredentials(
          activePlaylist.credentials,
        );
        if (result.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth validation failed", error);
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    void checkAuth();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
