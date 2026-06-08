"use client";

import { useEffect } from "react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuthStore } from "@/store/auth-store";

/**
 * Hidrata el auth store con los datos del perfil SWR.
 * Usa un componente interno para evitar que los re-renders
 * del hook provoquen re-renders en todo el layout.
 */
function HydratorInner() {
  const { profile, isLoading, error } = useProfile();
  const { setProfile, setRole, setLoading, clear } = useAuthStore();

  useEffect(() => {
    if (isLoading) {
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
  }, [profile, isLoading, error, setProfile, setRole, setLoading, clear]);

  return null;
}

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HydratorInner />
      {children}
    </>
  );
}
