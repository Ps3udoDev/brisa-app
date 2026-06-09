"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, UserCheck } from "lucide-react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useCreateBudgetRequest } from "@/hooks/mutations/use-budget-requests";
import { profileService } from "@/lib/services/profiles.service";

interface CreateRequestDialogProps {
  onSuccess?: () => void;
}

export function CreateRequestDialog({ onSuccess }: CreateRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateBudgetRequest();

  const [superiorName, setSuperiorName] = useState<string | null>(null);
  const [superiorLoading, setSuperiorLoading] = useState(false);

  const [form, setForm] = useState({
    to_user_id: "",
    amount: "",
    reason: "",
  });
  const [error, setError] = useState("");

  // Precargar el nombre del jefe cuando se abre el modal
  useEffect(() => {
    if (!open || !profile?.parent_id) return;

    let cancelled = false;
    setSuperiorLoading(true);

    profileService
      .getById(profile.parent_id)
      .then((data) => {
        if (!cancelled) {
          const name = [data.first_name, data.last_name1].filter(Boolean).join(" ");
          setSuperiorName(name || "Superior");
          setForm((f) => ({ ...f, to_user_id: profile.parent_id! }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuperiorName("Superior");
          setForm((f) => ({ ...f, to_user_id: profile.parent_id! }));
        }
      })
      .finally(() => {
        if (!cancelled) setSuperiorLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, profile?.parent_id]);

  // Resetear al cerrar
  useEffect(() => {
    if (!open) {
      setForm({ to_user_id: profile?.parent_id || "", amount: "", reason: "" });
      setError("");
    }
  }, [open, profile?.parent_id]);

  const hasSuperior = !!profile?.parent_id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    if (!form.to_user_id) {
      setError("Debes seleccionar un superior");
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    try {
      await create({
        from_user_id: profile.id,
        to_user_id: form.to_user_id,
        amount,
        reason: form.reason || null,
        status: "pending",
      });

      setForm({ to_user_id: profile.parent_id || "", amount: "", reason: "" });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al enviar la solicitud");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva solicitud
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Solicitud de presupuesto
          </DialogTitle>
          <DialogDescription>
            Solicita fondos adicionales a tu superior.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Superior preseleccionado */}
          <div className="space-y-2">
            <Label htmlFor="req-to">Superior / Jefe operador</Label>
            {hasSuperior ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {superiorLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Cargando...
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {superiorName || "Superior"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Seleccionado automáticamente
                      </p>
                    </>
                  )}
                </div>
                {/* Input oculto para mantener el valor en el form */}
                <input type="hidden" value={form.to_user_id} />
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="req-to"
                  placeholder="UUID de tu jefe operador"
                  value={form.to_user_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, to_user_id: e.target.value }))
                  }
                  required
                />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  No tienes un superior asignado en tu perfil.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-amount">Monto solicitado</Label>
            <Input
              id="req-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-reason">Motivo</Label>
            <Input
              id="req-reason"
              placeholder="¿Para qué necesitas los fondos?"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
