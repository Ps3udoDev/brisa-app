"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Plus, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarNav } from "./sidebar";
import { Menu } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { useUnreadNotificationCount } from "@/hooks/queries/use-notifications";
import { useProfile } from "@/hooks/queries/use-profile";

export function TopBar() {
  const router = useRouter();
  const { profile: me } = useProfile();
  const { count: unreadCount } = useUnreadNotificationCount(me?.id);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8">
      {/* Mobile menu */}
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>}
          />
          <SheetContent side="left" className="p-0 w-64">
            <SidebarNav />
          </SheetContent>
        </Sheet>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="pl-9 w-64 bg-slate-100 dark:bg-slate-800 border-0"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white rounded-full"
          onClick={() => router.push("/transactions")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar transacción
        </Button>

        <Link
          href="/notifications"
          className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium text-slate-900 dark:text-white">
              {me?.first_name ?? "Usuario"} {me?.last_name1 ?? ""}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
