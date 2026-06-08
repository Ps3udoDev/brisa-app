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
import { Loader2, UserPlus } from "lucide-react";
import { invalidateWithCascade } from "@/lib/swr/invalidate";

interface RegisterAssociateDialogProps {
  onSuccess?: () => void;
}

export function RegisterAssociateDialog({
  onSuccess,
}: RegisterAssociateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name1: "",
    role: "asociado" as "asociado" | "jefe_operador",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Error al registrar",
        );
        setIsLoading(false);
        return;
      }

      // Invalidar cache para que aparezca en la lista
      await invalidateWithCascade("profiles");

      setForm({
        email: "",
        password: "",
        first_name: "",
        last_name1: "",
        role: "asociado",
      });
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error de red");
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Registrar asociado
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Registrar asociado
          </DialogTitle>
          <DialogDescription>
            Crea una cuenta nueva para un asociado o jefe operador. Se vinculará
            automáticamente a ti.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-first_name">Nombre</Label>
              <Input
                id="reg-first_name"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-last_name1">Apellido</Label>
              <Input
                id="reg-last_name1"
                value={form.last_name1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name1: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Correo electrónico</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="asociado@empresa.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Contraseña</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-role">Rol</Label>
            <select
              id="reg-role"
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as "asociado" | "jefe_operador",
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="asociado">Asociado</option>
              <option value="jefe_operador">Jefe Operador</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar usuario"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
