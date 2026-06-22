"use client";

import { useEffect } from "react";

/** Registra el service worker (necesario para instalación y Web Push). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Silencioso: si falla (p. ej. http sin localhost), la app sigue igual.
      });
  }, []);

  return null;
}
