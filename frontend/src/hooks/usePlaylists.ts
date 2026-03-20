import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export interface PlaylistSong {
  songId: string;
  addedAt: string;
  song: {
    id: string;
    title: string;
    audioUrl: string;
    coverUrl: string | null;
    duration: number;
    plays: number;
    author: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
}

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string | null;
  createdAt: string;
  songs: PlaylistSong[];
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylists = useCallback(() => {
    setIsLoading(true);
    api
      .get("/playlists")
      .then(({ data }) => setPlaylists(data))
      .catch(() => setPlaylists([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (title: string) => {
    const { data } = await api.post("/playlists", { title });
    setPlaylists((prev) => [data, ...prev]);
    return data;
  };

  const deletePlaylist = async (id: string) => {
    await api.delete(`/playlists/${id}`);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
    fetchPlaylists,
  };
};
