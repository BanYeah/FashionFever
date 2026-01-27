import { create } from "zustand";

interface User {
  account: "user" | "judge" | "admin";
  minicode: string | null;
}

interface AuthState {
  user: User | null;
  isInitialized: boolean; // 초기화 여부 (새로고침 시 체크 확인용)
  setUser: (user: User | null) => void;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (val) => set({ isInitialized: val }),
}));
