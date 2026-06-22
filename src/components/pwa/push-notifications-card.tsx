"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pushSubscriptionService } from "@/lib/services/push-subscriptions.service";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushNotificationsCard() {
  const [supported, setSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const ok =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscription(sub))
      .catch(() => {});
  }, []);

  async function enable() {
    setMessage("");
    if (!VAPID_PUBLIC_KEY) {
      setMessage("Falta configurar la clave VAPID pública en el servidor.");
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permiso de notificaciones denegado.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY,
        ) as BufferSource,
      });
      await pushSubscriptionService.save(sub.toJSON(), navigator.userAgent);
      setSubscription(sub);
      setMessage("Notificaciones activadas en este dispositivo.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo activar.");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setMessage("");
    setLoading(true);
    try {
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await pushSubscriptionService.removeByEndpoint(endpoint);
      }
      setSubscription(null);
      setMessage("Notificaciones desactivadas en este dispositivo.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo desactivar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones push</CardTitle>
        <CardDescription>
          Recibe avisos (aportes, asignaciones, metas…) en tu dispositivo aunque
          la app esté cerrada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!supported ? (
          <p className="text-sm text-muted-foreground">
            Este navegador no soporta notificaciones push. En iPhone, primero
            instala la app en tu pantalla de inicio.
          </p>
        ) : subscription ? (
          <Button
            type="button"
            variant="outline"
            onClick={disable}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BellOff className="w-4 h-4 mr-2" />
            )}
            Desactivar notificaciones
          </Button>
        ) : (
          <Button
            type="button"
            onClick={enable}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Activar notificaciones
          </Button>
        )}
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}
