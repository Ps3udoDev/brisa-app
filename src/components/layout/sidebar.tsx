"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { Logo } from "@/components/landing/logo";
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
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/associates", label: "Associates", icon: Users },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/debts", label: "Debts", icon: Wallet },
  { href: "/requests", label: "Requests", icon: HandCoins },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/simulator", label: "Simulator", icon: Calculator },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
      {/* Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo width={40} height={40} />
          <div>
            <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              Brisa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Financial Serenity
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
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
