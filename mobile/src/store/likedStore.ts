import { create } from "zustand";
import api from "../api/api";

interface LikedStore {
  likedIds: Set<string>;
  fetchLiked: () => Promise<void>;
  likeSong: (songId: string) => Promise<void>;
  unlikeSong: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
}

export const useLikedStore = create<LikedStore>((set, get) => ({
  likedIds: new Set(),

  fetchLiked: async () => {
    try {
      const { data } = await api.get("/liked");
      const ids = new Set<string>(data.map((item: any) => item.songId));
      set({ likedIds: ids });
    } catch {
      set({ likedIds: new Set() });
    }
  },

  likeSong: async (songId) => {
    try {
      await api.post("/liked", { songId });
      set((state) => ({
        likedIds: new Set([...state.likedIds, songId]),
      }));
    } catch (error: any) {
      // ============= SI YA ESTÁ LIKEADO (409), IGUAL LO MARCAMOS COMO LIKED EN EL STORE ============0
      if (error?.response?.status === 409) {
        set((state) => ({
          likedIds: new Set([...state.likedIds, songId]),
        }));
      }
    }
  },

  unlikeSong: async (songId) => {
    await api.delete(`/liked/${songId}`);
    set((state) => {
      const next = new Set(state.likedIds);
      next.delete(songId);
      return { likedIds: next };
    });
  },

  isLiked: (songId) => get().likedIds.has(songId),
}));
