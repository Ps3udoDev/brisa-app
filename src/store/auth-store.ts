import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, UserRole } from "@/types/domain";

interface AuthState {
  // Datos del usuario autenticado (hidratados desde el server)
  profile: Profile | null;
  role: UserRole | null;
  permissions: string[];
  isLoading: boolean;

  // Acciones
  setProfile: (profile: Profile | null) => void;
  setRole: (role: UserRole | null) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;

  // Helpers
  isSuperAdmin: () => boolean;
  isJefeOperador: () => boolean;
  isAsociado: () => boolean;
  hasPermission: (perm: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      role: null,
      permissions: [],
      isLoading: true,

      setProfile: (profile) => set({ profile }),
      setRole: (role) => set({ role }),
      setPermissions: (permissions) => set({ permissions }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () =>
        set({ profile: null, role: null, permissions: [], isLoading: false }),

      isSuperAdmin: () => get().role === "super_admin",
      isJefeOperador: () => get().role === "jefe_operador",
      isAsociado: () => get().role === "asociado",
      hasPermission: (perm) => get().permissions.includes(perm),
    }),
    {
      name: "brisa-auth-store",
      partialize: (state) => ({
        role: state.role,
        permissions: state.permissions,
      }),
    }
  )
);
