import { cn } from "@renderer/lib/utils";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

export const ProtectedRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const playlists = await window.api.playlist.fetch();

      const activePlaylist = playlists.find(
        (playlist) => playlist.isActive === true,
      );

      if (!activePlaylist || !playlists || playlists.length === 0) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      if (!activePlaylist) {
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // Validate credentials on startup as per plan
      try {
        const result = await window.api.playlist.validate({
          server: activePlaylist.server,
          username: activePlaylist.username,
          password: activePlaylist.password,
        });
        if (result.isValid) {
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
      <div
        className={cn(
          "flex",
          "items-center",
          "justify-center",
          "h-screen",
          "bg-zinc-950",
          "text-white",
        )}
      >
        <div
          className={cn(
            "animate-spin",
            "rounded-full",
            "h-12",
            "w-12",
            "border-t-2",
            "border-b-2",
            "border-amber-400",
          )}
        ></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
