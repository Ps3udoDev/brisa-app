"use client";

import { ChevronRight, Shield, User, Users } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";

interface AssociateCardProps {
  profile: Profile & { user_balances?: { balance: number } | null };
  index?: number;
}

const roleConfig: Record<
  string,
  { label: string; icon: React.ReactNode; variant: string }
> = {
  super_admin: {
    label: "Super Admin",
    icon: <Shield className="w-3.5 h-3.5" />,
    variant:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  jefe_operador: {
    label: "Jefe Operador",
    icon: <Users className="w-3.5 h-3.5" />,
    variant: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  asociado: {
    label: "Asociado",
    icon: <User className="w-3.5 h-3.5" />,
    variant:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function AssociateCard({ profile, index = 0 }: AssociateCardProps) {
  const displayName =
    [profile.first_name, profile.last_name1].filter(Boolean).join(" ") ||
    "Sin nombre";

  const roleInfo =
    roleConfig[profile.role ?? "asociado"] ?? roleConfig.asociado;
  const balance = profile.user_balances?.balance ?? 0;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/associates/${profile.id}`} className="block group">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-[0_8px_30px_rgba(44,53,57,0.06)] transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                  {displayName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      roleInfo.variant,
                    )}
                  >
                    {roleInfo.icon}
                    {roleInfo.label}
                  </span>
                  {profile.parent_id && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Vinculado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Balance
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    balance >= 0
                      ? "text-slate-900 dark:text-white"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}
