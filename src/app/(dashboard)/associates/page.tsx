"use client";

import { Loader2, Shield, UserPlus, Users, Wallet } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AssociateCard } from "@/components/associates/associate-card";
import { StatCard } from "@/components/data-display/stat-card";
import { Button } from "@/components/ui/button";
import {
  useAssociates,
  useSubordinateProfiles,
} from "@/hooks/queries/use-associates";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAuth } from "@/hooks/use-auth";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

const roleFilters: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "jefe_operador", label: "Jefes Operadores" },
  { value: "asociado", label: "Asociados" },
];

export default function AssociatesPage() {
  const { profile: me } = useProfile();
  const { isSuperAdmin, isJefeOperador } = useAuth();
  const { associates, isLoading: directLoading } = useAssociates(me?.id);
  const { profiles: allProfiles, isLoading: allLoading } =
    useSubordinateProfiles(me?.id);

  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"direct" | "all">("direct");

  const canRegister = isSuperAdmin() || isJefeOperador();

  const profiles = viewMode === "direct" ? associates : allProfiles;
  const isLoading = viewMode === "direct" ? directLoading : allLoading;

  const filteredProfiles =
    roleFilter === "all"
      ? profiles
      : profiles.filter((p) => p.role === roleFilter);

  const totalBalance = filteredProfiles.reduce(
    (sum, p) => sum + (p.user_balances?.balance ?? 0),
    0,
  );

  const jefeCount = profiles.filter((p) => p.role === "jefe_operador").length;
  const asociadoCount = profiles.filter((p) => p.role === "asociado").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">
            Asociados
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona tu equipo y su jerarquía financiera
          </p>
        </div>

        {canRegister && (
          <Link href="/register">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Registrar asociado
            </Button>
          </Link>
        )}
      </m.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total asociados"
          amount={String(profiles.length)}
          icon={<Users className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          title="Balance del equipo"
          amount={formatCurrency(totalBalance)}
          icon={<Wallet className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          title="Jefes operadores"
          amount={String(jefeCount)}
          icon={<Shield className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          title="Asociados"
          amount={String(asociadoCount)}
          icon={<UserPlus className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("direct")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "direct"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            Directos
          </button>
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            Toda la red
          </button>
        </div>

        <div className="flex items-center gap-2">
          {roleFilters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === filter.value
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No tienes asociados en esta categoría
          </p>
          {canRegister && (
            <Link href="/register">
              <Button
                variant="outline"
                className="mt-4 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrar un asociado
              </Button>
            </Link>
          )}
        </m.div>
      ) : (
        <div className="space-y-3">
          {filteredProfiles.map((profile, i) => (
            <AssociateCard key={profile.id} profile={profile} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
