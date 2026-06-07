"use client";

import { SWRConfig } from "swr";
import { createBrowserSB } from "@/lib/supabase/client";

const fetcher = async (key: string | (readonly unknown[])) => {
  // SWR keys pueden ser strings o arrays. En Brisa usamos arrays.
  // Los fetchers reales se definen en los hooks; este es un fallback.
  if (typeof key === "string") {
    const res = await fetch(key);
    if (!res.ok) throw new Error("An error occurred while fetching the data.");
    return res.json();
  }
  throw new Error("Array keys require a custom fetcher in the hook.");
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        shouldRetryOnError: (err) => {
          // No reintentar en errores de autenticación
          if (err.status === 401 || err.status === 403) return false;
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
