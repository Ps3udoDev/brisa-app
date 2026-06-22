"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { PushNotificationsCard } from "@/components/pwa/push-notifications-card";
import { UserManagementCard } from "@/components/settings/user-management-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { updateAccount } from "@/lib/actions/auth";
import { profileService } from "@/lib/services/profiles.service";

type ProfileForm = {
  first_name: string;
  middle_name: string;
  last_name1: string;
  last_name2: string;
  phone: string;
  avatar_url: string;
  timezone: string;
};

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export default function SettingsPage() {
  const { profile, isLoading, mutate } = useProfile();
  const { role } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ProfileForm | null>(null);

  // Zona horaria detectada del navegador (se guarda al actualizar el perfil).
  const [detectedTz, setDetectedTz] = useState("");
  useEffect(() => {
    setDetectedTz(detectTimezone());
  }, []);

  const profileForm: ProfileForm = {
    first_name: profile?.first_name || "",
    middle_name: profile?.middle_name || "",
    last_name1: profile?.last_name1 || "",
    last_name2: profile?.last_name2 || "",
    phone: profile?.phone || "",
    avatar_url: profile?.avatar_url || "",
    timezone: profile?.timezone || detectedTz,
  };
  const formValues = form ?? profileForm;

  function updateFormField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({
      ...profileForm,
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage("");

    let nextMessage = "Perfil actualizado correctamente";

    try {
      await profileService.update(profile.id, {
        ...formValues,
        // Persistimos la zona horaria detectada si el perfil aún no tenía una.
        timezone: formValues.timezone || detectedTz,
      });
      await mutate();
    } catch (err) {
      nextMessage = err instanceof Error ? err.message : "Error al actualizar";
    }

    setMessage(nextMessage);
    setIsSaving(false);
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

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="h-16 w-16">
              {formValues.avatar_url && (
                <AvatarImage src={formValues.avatar_url} alt={displayName} />
              )}
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
            <Alert
              variant={message.includes("Error") ? "destructive" : "default"}
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={formValues.first_name}
                  onChange={(e) =>
                    updateFormField("first_name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Segundo nombre</Label>
                <Input
                  id="middle_name"
                  value={formValues.middle_name}
                  onChange={(e) =>
                    updateFormField("middle_name", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_name1">Apellido paterno</Label>
                <Input
                  id="last_name1"
                  value={formValues.last_name1}
                  onChange={(e) =>
                    updateFormField("last_name1", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name2">Apellido materno</Label>
                <Input
                  id="last_name2"
                  value={formValues.last_name2}
                  onChange={(e) =>
                    updateFormField("last_name2", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formValues.phone}
                  onChange={(e) => updateFormField("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL del avatar</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://..."
                  value={formValues.avatar_url}
                  onChange={(e) =>
                    updateFormField("avatar_url", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                value={formValues.timezone}
                onChange={(e) => updateFormField("timezone", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Detectada de tu navegador: {detectedTz || "—"}. Se usa para
                programar tus pagos recurrentes.
              </p>
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

      {/* Instalar como app (PWA) */}
      <InstallAppCard />

      {/* Notificaciones push */}
      <PushNotificationsCard />

      {/* Cuenta */}
      <AccountCard />

      {/* Gestión de usuarios (solo super_admin) */}
      {role === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Administra las cuentas de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementCard />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!email && !password) {
      setIsError(true);
      setMessage("Indica un nuevo correo o una nueva contraseña");
      return;
    }
    if (password && password.length < 8) {
      setIsError(true);
      setMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSaving(true);
    const result = await updateAccount({
      email: email || undefined,
      password: password || undefined,
    });
    setIsSaving(false);

    if (result.success) {
      setMessage(
        email
          ? "Listo. Revisa tu correo para confirmar el cambio de email."
          : "Cuenta actualizada correctamente.",
      );
      setEmail("");
      setPassword("");
    } else {
      setIsError(true);
      setMessage(result.error || "No se pudo actualizar la cuenta");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta</CardTitle>
        <CardDescription>
          Cambia tu correo de acceso o tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant={isError ? "destructive" : "default"} className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-email">Nuevo correo</Label>
            <Input
              id="account-email"
              type="email"
              placeholder="nuevo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-password">Nueva contraseña</Label>
            <Input
              id="account-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
              "Actualizar cuenta"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
