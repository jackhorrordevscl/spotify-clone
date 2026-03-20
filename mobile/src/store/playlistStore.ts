import { create } from "zustand";
import api from "../api/api";

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

interface PlaylistStore {
  playlists: Playlist[];
  isLoading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (title: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  isLoading: false,

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/playlists");
      set({ playlists: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (title) => {
    const { data } = await api.post("/playlists", { title });
    set((state) => ({ playlists: [data, ...state.playlists] }));
    return data;
  },

  deletePlaylist: async (id) => {
    await api.delete(`/playlists/${id}`);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
    }));
  },

  addSongToPlaylist: async (playlistId, songId) => {
    await api.post(`/playlists/${playlistId}/songs`, { songId })
    await get().fetchPlaylists()
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    await api.delete(`/playlists/${playlistId}/songs/${songId}`)
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter((s) => s.songId !== songId) }
          : p,
      ),
    }))
  },
}))
