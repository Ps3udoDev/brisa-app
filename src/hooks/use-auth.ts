"use client";

import { useEffect } from "react";
import { useProfile } from "./queries/use-profile";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const { profile, isLoading: profileLoading, error } = useProfile();
  const { setProfile, setRole, setLoading, clear } = useAuthStore();

  useEffect(() => {
    if (profileLoading) {
      setLoading(true);
      return;
    }

    if (error) {
      clear();
      return;
    }

    if (profile) {
      setProfile(profile);
      setRole(profile.role as "super_admin" | "jefe_operador" | "asociado");
      setLoading(false);
    }
  }, [profile, profileLoading, error, setProfile, setRole, setLoading, clear]);

  const store = useAuthStore();

  return {
    user: store.profile,
    role: store.role,
    isLoading: profileLoading || store.isLoading,
    isAuthenticated: !!store.profile,
    isSuperAdmin: store.isSuperAdmin,
    isJefeOperador: store.isJefeOperador,
    isAsociado: store.isAsociado,
    hasPermission: store.hasPermission,
  };
}
