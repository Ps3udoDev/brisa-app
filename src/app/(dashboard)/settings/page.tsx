"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { profileService } from "@/lib/services/profiles.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { profile, isLoading, mutate } = useProfile();
  const { role } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name1: "",
    last_name2: "",
  });

  // Sync form when profile loads
  if (profile && !form.first_name && profile.first_name) {
    setForm({
      first_name: profile.first_name || "",
      middle_name: profile.middle_name || "",
      last_name1: profile.last_name1 || "",
      last_name2: profile.last_name2 || "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage("");

    try {
      await profileService.update(profile.id, form);
      await mutate();
      setMessage("Perfil actualizado correctamente");
    } catch (err: any) {
      setMessage(err.message || "Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  }

  const displayName =
    [profile?.first_name, profile?.last_name1].filter(Boolean).join(" ") ||
    "Usuario";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-orange-100 text-orange-700 text-xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{displayName}</p>
              <Badge variant="secondary">{role || "Usuario"}</Badge>
            </div>
          </div>

          {message && (
            <Alert variant={message.includes("Error") ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, first_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Segundo nombre</Label>
                <Input
                  id="middle_name"
                  value={form.middle_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, middle_name: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_name1">Apellido paterno</Label>
                <Input
                  id="last_name1"
                  value={form.last_name1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_name1: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name2">Apellido materno</Label>
                <Input
                  id="last_name2"
                  value={form.last_name2}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_name2: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
