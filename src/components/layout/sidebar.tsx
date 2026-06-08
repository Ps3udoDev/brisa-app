"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/landing/logo";
import { useUnreadNotificationCount } from "@/hooks/queries/use-notifications";
import { useProfile } from "@/hooks/queries/use-profile";
import { BrisaBubble } from "./brisa-bubble";

import {
  LayoutDashboard,
  Users,
  Receipt,
  Target,
  Wallet,
  HandCoins,
  BarChart3,
  Calculator,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/associates", label: "Asociados", icon: Users },
  { href: "/transactions", label: "Transacciones", icon: Receipt },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/debts", label: "Deudas", icon: Wallet },
  { href: "/requests", label: "Solicitudes", icon: HandCoins },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/simulator", label: "Simulador", icon: Calculator },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { profile: me } = useProfile();
  const { count: unreadCount } = useUnreadNotificationCount(me?.id);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo width={74} height={74} />
          <div>
            <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              Brisa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Serenidad Financiera
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Brisa mascot */}
      <div className="p-4 flex flex-col items-center border-t border-slate-200 dark:border-slate-800">
        <BrisaBubble position="top">
          <img
            src="/brisa-sitting.gif"
            alt="Brisa"
            className="w-24 h-auto object-contain cursor-pointer hover:scale-105 transition-transform"
          />
        </BrisaBubble>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Brisa</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
      <SidebarNav />
    </aside>
  );
}
