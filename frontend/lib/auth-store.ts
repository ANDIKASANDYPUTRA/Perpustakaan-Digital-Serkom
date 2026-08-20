import { create } from "zustand";
import Cookies from "js-cookie";
import api, { TOKEN_KEY } from "./axios";
import type { User, LoginPayload, RegisterPayload, ApiResponse, RoleName } from "./types";

/* ═══════════════════════════════════════════════════
   Auth Store — Zustand
   Manages authentication state, token persistence,
   and role-based access helpers.
   ═══════════════════════════════════════════════════ */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  hydrate: () => void;

  // Helpers
  getRoleName: () => RoleName | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: Cookies.get(TOKEN_KEY) || null,
  isAuthenticated: !!Cookies.get(TOKEN_KEY),
  isLoading: false,

  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "lax" });
    set({ token, isAuthenticated: true });
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<ApiResponse<User>>("/login", payload);
      const token = data.token!;
      get().setToken(token);

      // Fetch full user profile with role
      await get().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<ApiResponse<User>>("/register", payload);
      const token = data.token!;
      get().setToken(token);
      await get().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<ApiResponse<User>>("/me");
      set({ user: data.data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false, token: null });
      Cookies.remove(TOKEN_KEY);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore errors on logout
    } finally {
      Cookies.remove(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  hydrate: () => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchUser();
    }
  },

  getRoleName: () => {
    const user = get().user;
    if (!user?.role?.nama_role) return null;
    const role = user.role.nama_role.toLowerCase() as RoleName;
    if (role === "peminjam") return "peminjam";
    if (role === "petugas") return "petugas";
    return role;
  },
}));
