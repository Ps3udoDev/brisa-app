"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";

interface TreeNodeProps {
  profile: Profile & { user_balances?: { balance: number } | null };
  level: number;
  children: React.ReactNode;
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function TreeNode({ profile, level, children }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!children;

  const displayName =
    [profile.first_name, profile.last_name1].filter(Boolean).join(" ") ||
    "Sin nombre";

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    jefe_operador: "Jefe Operador",
    asociado: "Asociado",
  };

  const balance = profile.user_balances?.balance ?? 0;

  return (
    <div>
      <m.div
        className="flex items-center gap-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 transition-colors cursor-pointer"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )
        ) : (
          <div className="w-4" />
        )}

        <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-xs shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {roleLabels[profile.role ?? "asociado"] ?? "Asociado"}
          </p>
        </div>

        <p
          className={cn(
            "text-sm font-semibold shrink-0",
            balance >= 0
              ? "text-slate-900 dark:text-white"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {formatCurrency(balance)}
        </p>
      </m.div>

      {expanded && children && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </m.div>
      )}
    </div>
  );
}

interface AssociateTreeProps {
  profiles: (Profile & { user_balances?: { balance: number } | null })[];
  rootId?: string;
}

export function AssociateTree({ profiles, rootId }: AssociateTreeProps) {
  const buildTree = (
    parentId: string | null,
    level: number,
  ): React.ReactNode => {
    const children = profiles.filter((p) =>
      parentId === null ? p.parent_id === null : p.parent_id === parentId,
    );

    if (children.length === 0) return null;

    return children.map((profile) => (
      <TreeNode key={profile.id} profile={profile} level={level}>
        {buildTree(profile.id, level + 1)}
      </TreeNode>
    ));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {buildTree(rootId ?? null, 0)}
    </div>
  );
}
