"use client";

import { useAuth } from "@/hooks/use-auth";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  // Este hook hidrata el auth store con los datos del perfil
  useAuth();
  return <>{children}</>;
}
