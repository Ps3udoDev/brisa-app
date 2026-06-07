"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-[#E2875C]/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-[#F3C1B6]/15 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative max-w-2xl mx-auto text-center"
      >
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2C3539] mb-6 leading-tight">
          La tranquilidad financiera
          <br />
          <span className="text-[#E2875C]">empieza hoy</span>
        </h2>
        <p className="text-lg text-[#8A9597] mb-10 max-w-md mx-auto">
          Únete a los equipos que gestionan su dinero con calma, orden y
          propósito.
        </p>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#E2875C] text-white rounded-full font-medium text-lg hover:bg-[#d67a4f] transition-colors duration-300"
          >
            Comienza ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <p className="mt-6 text-sm text-[#8A9597]">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-[#E2875C] hover:underline font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
