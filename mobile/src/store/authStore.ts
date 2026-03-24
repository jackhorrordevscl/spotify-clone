import { create } from "zustand";
import api from "../api/api";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "../config";
import type { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;
      set({ token });
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ user: null, token: null });
    }
  },
}));
