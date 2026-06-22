"use client";

import { Check, Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// El evento beforeinstallprompt no está tipado en el lib estándar.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window),
    );
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari
        (navigator as unknown as { standalone?: boolean }).standalone === true,
    );

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setIsStandalone(true));
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instalar la app</CardTitle>
        <CardDescription>
          Añade Brisa a tu pantalla de inicio para abrirla como una app y
          recibir notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isStandalone ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            Ya tienes Brisa instalada en este dispositivo.
          </div>
        ) : isIOS ? (
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Share className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              En iPhone/iPad: toca el botón <strong>Compartir</strong> y luego{" "}
              <strong>“Agregar a pantalla de inicio”</strong>.
            </span>
          </p>
        ) : deferred ? (
          <Button
            type="button"
            onClick={handleInstall}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Instalar app
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Para instalarla, abre el menú de tu navegador y elige{" "}
            <strong>“Instalar app”</strong> o{" "}
            <strong>“Agregar a pantalla de inicio”</strong>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
