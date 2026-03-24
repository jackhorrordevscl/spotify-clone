import { create } from "zustand";
import type { Song } from "../types";

interface PlayerStore {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,

  playSong: (song, queue = []) => {
    set({ currentSong: song, queue, isPlaying: true, currentTime: 0 });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (volume) => set({ volume }),

  setCurrentTime: (time) => set({ currentTime: time }),

  playNext: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const next = queue[idx + 1];
    if (next) set({ currentSong: next, isPlaying: true, currentTime: 0 });
  },

  playPrev: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const prev = queue[idx - 1];
    if (prev) set({ currentSong: prev, isPlaying: true, currentTime: 0 });
  },
}));
