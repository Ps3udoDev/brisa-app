"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AssociateSearchInput } from "@/components/ui/associate-search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGoal } from "@/hooks/mutations/use-goals";
import { useProfile } from "@/hooks/queries/use-profile";

interface CreateGoalDialogProps {
  onSuccess?: () => void;
}

type ContributorRow = { userId: string | null; amount: string };

export function CreateGoalDialog({ onSuccess }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateGoal();

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    deadline: "",
  });
  // Beneficiario de la meta (para quién es). Si no se elige, eres tú.
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [contributors, setContributors] = useState<ContributorRow[]>([
    { userId: null, amount: "" },
  ]);
  const [error, setError] = useState("");

  // Pre-rellenar el primer aportante con el creador (tú) al abrir.
  useEffect(() => {
    if (open && profile) {
      setContributors((rows) =>
        rows.length > 0 && rows[0].userId === null
          ? [{ userId: profile.id, amount: rows[0].amount }, ...rows.slice(1)]
          : rows,
      );
    }
  }, [open, profile]);

  function reset() {
    setForm({ name: "", target_amount: "", deadline: "" });
    setAssignedTo(null);
    setContributors([{ userId: profile?.id ?? null, amount: "" }]);
    setError("");
  }

  function updateContributor(i: number, patch: Partial<ContributorRow>) {
    setContributors((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    const target = parseFloat(form.target_amount);
    if (Number.isNaN(target) || target <= 0) {
      setError("La meta debe ser un número positivo");
      return;
    }

    // Aportantes válidos (con persona y monto > 0); deduplicar por persona.
    const valid: { user_id: string; committed_amount: number }[] = [];
    const seen = new Set<string>();
    for (const r of contributors) {
      const amt = parseFloat(r.amount);
      if (r.userId && !Number.isNaN(amt) && amt > 0 && !seen.has(r.userId)) {
        seen.add(r.userId);
        valid.push({ user_id: r.userId, committed_amount: amt });
      }
    }

    try {
      await create(
        {
          name: form.name,
          target_amount: target,
          deadline: form.deadline || undefined,
          creator_id: profile.id,
          assigned_to: assignedTo ?? profile.id,
          status: "active",
        },
        valid,
      );
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la meta");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva meta
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Nueva meta</DialogTitle>
          <DialogDescription>
            Define un objetivo y quiénes aportan a él (tú y/o tus asociados).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="goal-name">Nombre de la meta</Label>
            <Input
              id="goal-name"
              placeholder="Ej: Fondo de emergencia"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Monto objetivo</Label>
              <Input
                id="goal-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.target_amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target_amount: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Fecha límite</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beneficiario (¿para quién es la meta?)</Label>
            <AssociateSearchInput
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Buscar persona... (por defecto, tú)"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A esta persona se le notifica la meta y la verá en su perfil. Si
              no eliges a nadie, la meta es para ti.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Aportantes</Label>
            {contributors.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: filas locales sin id estable
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <AssociateSearchInput
                    value={row.userId}
                    onChange={(id) => updateContributor(i, { userId: id })}
                    placeholder="Buscar persona..."
                  />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Aporte"
                  value={row.amount}
                  onChange={(e) =>
                    updateContributor(i, { amount: e.target.value })
                  }
                  className="w-28"
                />
                {contributors.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setContributors((rows) =>
                        rows.filter((_, idx) => idx !== i),
                      )
                    }
                    className="shrink-0 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setContributors((rows) => [
                  ...rows,
                  { userId: null, amount: "" },
                ])
              }
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Agregar aportante
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada aportante indica cuánto se compromete a aportar. Es opcional;
              luego cada uno registra sus aportes reales desde la meta.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Crear meta"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
