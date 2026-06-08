"use client";

import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="py-10 px-4 sm:px-6 border-t border-[#8A9597]/10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo width={32} height={32} />
          <span className="font-serif font-semibold text-[#2C3539]">Brisa</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-[#8A9597]">
          <Link href="/login" className="hover:text-[#E2875C] transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/login" className="hover:text-[#E2875C] transition-colors">
            Panel
          </Link>
        </nav>

        <p className="text-sm text-[#8A9597]/70">Hecho con calma</p>
      </div>
    </footer>
  );
}
