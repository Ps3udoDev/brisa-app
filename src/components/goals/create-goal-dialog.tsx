"use client";

import { useState } from "react";
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
import { Loader2, Plus } from "lucide-react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useCreateGoal } from "@/hooks/mutations/use-goals";
import { AssociateSearchInput } from "@/components/ui/associate-search";

interface CreateGoalDialogProps {
  onSuccess?: () => void;
}

export function CreateGoalDialog({ onSuccess }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { create, isLoading } = useCreateGoal();

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    deadline: "",
    assigned_to: null as string | null,
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Debes iniciar sesión");
      return;
    }

    const target = parseFloat(form.target_amount);
    if (isNaN(target) || target <= 0) {
      setError("La meta debe ser un número positivo");
      return;
    }

    try {
      await create({
        name: form.name,
        target_amount: target,
        deadline: form.deadline || undefined,
        creator_id: profile.id,
        assigned_to: form.assigned_to ?? profile.id,
        status: "active",
      });

      setForm({ name: "", target_amount: "", deadline: "", assigned_to: null });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al crear la meta");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Define un objetivo de ahorro con monto y fecha límite.
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
                onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Fecha límite</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asignar a</Label>
            <AssociateSearchInput
              value={form.assigned_to}
              onChange={(id) => setForm((f) => ({ ...f, assigned_to: id }))}
              placeholder="Buscar asociado por nombre..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si no seleccionas nadie, la meta se asignará a ti.
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
