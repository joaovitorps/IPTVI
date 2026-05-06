import { Credentials, Playlist } from "@/shared/types";
import { format } from "date-fns";
import {
  Edit2,
  LoaderCircleIcon,
  Lock,
  Play,
  Plus,
  Server,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { useAuthState } from "../stores/authStore";

export const Login = () => {
  const playlists = useAuthState((state) => state.playlists) || [];
  const updatePlaylists = useAuthState((state) => state.setPlaylists);
  const [formValues, setFormValues] = useState({
    server: "",
    username: "",
    password: "",
    name: "",
  });
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setFormValues({
      server: playlist.credentials.server,
      username: playlist.credentials.username,
      password: playlist.credentials.password,
      name: playlist.name,
    });
    setEditingPlaylistId(playlist.id);
    setError(null);
  };

  const resetForm = () => {
    setFormValues({
      server: "",
      username: "",
      password: "",
      name: "",
    });
    setEditingPlaylistId(null);
    setError(null);
  };

  useEffect(() => {
    updatePlaylists(window.electron.store.getPlaylists());
  }, [updatePlaylists]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const server = ((formData.get("server") as string) || "").trim();
    const username = ((formData.get("username") as string) || "").trim();
    const password = ((formData.get("password") as string) || "").trim();
    const name = ((formData.get("name") as string) || "").trim();

    const credentials: Credentials = { server, username, password };

    const isCredentialsValid =
      await window.authAPI.validateCredentials(credentials);

    if (isCredentialsValid?.ok) {
      const currentPlaylists = window.electron.store.getPlaylists();
      let newPlaylists: Playlist[];
      let targetId: string;

      if (editingPlaylistId) {
        targetId = editingPlaylistId;
        newPlaylists = currentPlaylists.map((p: Playlist) =>
          p.id === editingPlaylistId ? { ...p, name, credentials } : p,
        );
        window.electron.store.set("playlists", newPlaylists);
      } else {
        targetId = crypto.randomUUID();
        const newPlaylist: Playlist = {
          id: targetId,
          name,
          credentials,
          is_active: 0,
          created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        };
        window.electron.store.appendToArray("playlists", newPlaylist);
      }

      window.electron.store.set("activePlaylistId", targetId);
      updatePlaylists(window.electron.store.getPlaylists());
      window.location.href = "/";
    } else {
      setError("Invalid credentials or server URL. Please check your details.");
    }
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
      <button
        type="submit"
        disabled={pending}
        className="w-full flex justify-center items-center gap-2 rounded-xl py-3 px-4 bg-amber-500 hover:bg-amber-600 transition-colors text-zinc-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : editingPlaylistId ? (
          "Update Connection"
        ) : (
          "Connect"
        )}
      </button>
    );
  };

  const removePlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    const newPlaylists = playlists.filter((p) => p.id !== playlistId);
    window.electron.store.set("playlists", newPlaylists);

    const activeId = window.electron.store.get("activePlaylistId");
    if (activeId === playlistId) {
      window.electron.store.set("activePlaylistId", "");
    }

    updatePlaylists(newPlaylists);
    if (editingPlaylistId === playlistId) {
      resetForm();
    }
  };

  const handlePlayPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    window.electron.store.set("activePlaylistId", playlistId);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row p-6 gap-8">
      {/* Sidebar: Profiles */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Server className="text-amber-500" /> Server Profiles
          </h2>
          <button
            onClick={resetForm}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Add New Profile"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
          {playlists.length === 0 ? (
            <div className="text-zinc-500 text-sm italic p-4 border border-dashed border-zinc-800 rounded-xl">
              No profiles saved yet.
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist)}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  editingPlaylistId === playlist.id
                    ? "bg-amber-500/10 border-amber-500/50"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-200">
                    {playlist.name || "Unnamed Profile"}
                  </span>
                  <span className="text-xs text-zinc-500 truncate max-w-37.5">
                    {playlist.credentials.server}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handlePlayPlaylist(e, playlist.id)}
                    className="p-2 text-zinc-400 hover:text-green-500"
                    title="Play"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlaylist(playlist);
                    }}
                    className="p-2 text-zinc-400 hover:text-amber-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => removePlaylist(e, playlist.id)}
                    className="p-2 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Form */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto w-full">
        <div className="w-full bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2 italic">
              IPTVI
            </h1>
            <p className="text-zinc-400 text-sm">
              {editingPlaylistId
                ? "Update your server credentials"
                : "Enter your IPTV server credentials"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                <Tag size={12} /> Playlist Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="My Awesome Playlist"
                value={formValues.name}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                <Server size={12} /> Server URL
              </label>
              <input
                name="server"
                type="text"
                placeholder="http://example.com:8080"
                value={formValues.server}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                  <User size={12} /> Username
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formValues.username}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <SubmitButton />
            </div>

            {editingPlaylistId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
