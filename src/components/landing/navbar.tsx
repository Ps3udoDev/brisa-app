"use client";

import Link from "next/link";
import { m } from "motion/react";
import { Logo } from "./logo";

export function Navbar() {
  return (
    <m.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-[#F9F6F0]/80 backdrop-blur-md border-b border-[#8A9597]/10"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo width={90} height={90} />
          <span className="font-serif text-xl font-semibold text-[#2C3539]">
            Brisa
          </span>
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-[#E2875C] text-white rounded-full text-sm font-medium shadow-[0_4px_20px_rgba(226,135,92,0.25)] hover:shadow-[0_6px_24px_rgba(226,135,92,0.4)] hover:scale-105 transition-all duration-300"
        >
          Iniciar sesión
        </Link>
      </div>
    </m.nav>
  );
}
