"use client";

import { Loader2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { RegisterAssociateDialog } from "@/components/associates/register-associate-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubordinateProfiles } from "@/hooks/queries/use-associates";
import { useProfile } from "@/hooks/queries/use-profile";
import { invalidateWithCascade } from "@/lib/swr/invalidate";
import type { Profile } from "@/types/domain";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  jefe_operador: "Jefe Operador",
  asociado: "Asociado",
};

function displayName(p: Profile) {
  return [p.first_name, p.last_name1].filter(Boolean).join(" ") || "Sin nombre";
}

export function UserManagementCard() {
  const { profile: me } = useProfile();
  const { profiles, isLoading } = useSubordinateProfiles(me?.id);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggleActive(userId: string, nextActive: boolean) {
    setPendingId(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: nextActive }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "No se pudo actualizar el estado",
        );
        return;
      }
      await invalidateWithCascade("profiles");
    } catch {
      setError("Error de red");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Gestión de usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Crea, activa o desactiva a los usuarios de tu red
          </p>
        </div>
        <RegisterAssociateDialog />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading && profiles.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No tienes usuarios en tu red todavía.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {profiles.map((p) => {
            const isActive = p.is_active !== false;
            const isSelf = p.id === me?.id;
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 text-sm font-semibold shrink-0">
                    {displayName(p).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {displayName(p)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">
                        {roleLabels[p.role ?? "asociado"] ?? p.role}
                      </Badge>
                      {!isActive && (
                        <span className="text-xs text-red-500">Inactivo</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pendingId === p.id || isSelf}
                  onClick={() => toggleActive(p.id, !isActive)}
                  className={
                    isActive
                      ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400"
                  }
                >
                  {pendingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    <>
                      <UserX className="w-4 h-4 mr-1.5" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1.5" />
                      Activar
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
