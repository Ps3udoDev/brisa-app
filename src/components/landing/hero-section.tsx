"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#E2875C]/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [-30, 30, -30], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-10 w-48 h-48 rounded-full bg-[#F3C1B6]/20 blur-2xl"
        />
        <motion.div
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-[#709A73]/10 blur-2xl"
        />
        <motion.svg
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-16 right-8 w-24 h-24 text-[#E2875C]/20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <circle cx="50" cy="50" r="40" />
        </motion.svg>
        <motion.svg
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-12 w-16 h-16 text-[#F3C1B6]/30"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <ellipse cx="50" cy="50" rx="45" ry="35" />
        </motion.svg>
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8"
        >
          <span className="w-2 h-2 bg-[#709A73] rounded-full" />
          <span className="text-sm text-[#8A9597]">Gestión financiera jerárquica</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#2C3539] leading-tight mb-6"
        >
          Gestion patrimonial con,
          <br />
          <span className="text-[#E2875C]">calidez felina</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-[#8A9597] max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Controla el flujo de caja global, asigna presupuestos a tu equipo,
          rastrea metas colectivas y gestiona solicitudes en tiempo real —
          todo con la tranquilidad que mereces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group px-8 py-4 bg-[#E2875C] text-white rounded-full font-medium shadow-[0_4px_20px_rgba(226,135,92,0.3)] hover:shadow-[0_8px_30px_rgba(226,135,92,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            Comienza ahora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#como-funciona"
            className="px-8 py-4 text-[#8A9597] hover:text-[#E2875C] font-medium transition-colors flex items-center gap-2"
          >
            Descubre cómo funciona
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
