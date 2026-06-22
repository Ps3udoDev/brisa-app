"use client";

import { HandCoins, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useContributeToGoal } from "@/hooks/mutations/use-goals";

interface ContributeGoalDialogProps {
  goalId: string;
  goalName: string;
}

export function ContributeGoalDialog({
  goalId,
  goalName,
}: ContributeGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { contribute, isLoading } = useContributeToGoal();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError("El aporte debe ser un número positivo");
      return;
    }
    try {
      await contribute(goalId, value, description || undefined);
      setAmount("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aportar");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError("");
          setAmount("");
          setDescription("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300"
          >
            <HandCoins className="w-4 h-4 mr-1.5" />
            Aportar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Aportar</DialogTitle>
          <DialogDescription>
            Registra un aporte a “{goalName}”. Se descontará de tu saldo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="contrib-amount">Monto</Label>
            <Input
              id="contrib-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrib-description">Nota (opcional)</Label>
            <Input
              id="contrib-description"
              placeholder="Ej: aporte de junio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                Aportando...
              </>
            ) : (
              "Registrar aporte"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
