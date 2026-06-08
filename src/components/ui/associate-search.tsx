"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { X, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSubordinateProfiles } from "@/hooks/queries/use-associates";
import { useProfile } from "@/hooks/queries/use-profile";
import type { Profile } from "@/types/domain";
import { cn } from "@/lib/utils";

function getFullName(p: Profile) {
  const parts = [
    p.first_name,
    p.middle_name,
    p.last_name1,
    p.last_name2,
  ].filter(Boolean);
  return parts.join(" ") || "Sin nombre";
}

interface AssociateSearchInputProps {
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}

export function AssociateSearchInput({
  value,
  onChange,
  placeholder = "Buscar asociado...",
}: AssociateSearchInputProps) {
  const { profile: me } = useProfile();
  const { profiles: subordinates, isLoading } = useSubordinateProfiles(me?.id);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Incluir al usuario actual + subordinados
  const options = useMemo(() => {
    const list: (Profile & { user_balances?: { balance: number } | null })[] = [];
    if (me) list.push(me);
    for (const s of subordinates) {
      if (s.id !== me?.id) list.push(s);
    }
    return list;
  }, [me, subordinates]);

  const selected = useMemo(
    () => options.find((p) => p.id === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((p) => {
      const fullName = getFullName(p).toLowerCase();
      const role = p.role.toLowerCase();
      return fullName.includes(q) || role.includes(q);
    });
  }, [options, query]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Abrir dropdown cuando se empieza a escribir
  useEffect(() => {
    if (query.trim()) setOpen(true);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors",
          open && "ring-2 ring-orange-500/20 border-orange-500"
        )}
        onClick={() => {
          if (!selected) inputRef.current?.focus();
        }}
      >
        {selected ? (
          <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 px-2.5 py-1 rounded-full text-sm">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">{getFullName(selected)}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setQuery("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="hover:text-orange-600 dark:hover:text-orange-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-sm placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && !selected && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              Cargando asociados...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              {query.trim()
                ? "No se encontraron asociados"
                : "Escribe para buscar asociados"}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p.id);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-semibold shrink-0">
                      {(p.first_name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {getFullName(p)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {p.role.replace("_", " ")}
                        {p.id === me?.id && " (Tú)"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
