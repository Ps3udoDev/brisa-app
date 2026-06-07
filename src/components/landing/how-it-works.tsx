"use client";

import { motion } from "motion/react";

const steps = [
  {
    step: "01",
    title: "Crea tu jerarquía",
    desc: "Registra tu equipo como Super Admin, asigna jefes operadores y vincula asociados. Todos bajo un mismo techo financiero.",
  },
  {
    step: "02",
    title: "Asigna y monitorea",
    desc: "Distribuye presupuestos desde tu caja general. Cada asociado gestiona sus fondos mientras tú mantienes visibilidad total.",
  },
  {
    step: "03",
    title: "Aprueba y crece",
    desc: "Recibe solicitudes de aumento en tiempo real, aprueba con un clic y observa cómo tu equipo alcanza sus metas.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2C3539] mb-4">
            Cómo funciona
          </h2>
          <p className="text-[#8A9597]">
            Tres pasos para transformar tu gestión financiera.
          </p>
        </motion.div>

        <div className="relative space-y-12">
          {/* Connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#E2875C]/20 hidden sm:block">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full bg-[#E2875C]/40"
            />
          </div>

          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 * i }}
              className="relative flex gap-6"
            >
              <div className="hidden sm:flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 * i, type: "spring" }}
                  className="w-12 h-12 rounded-full bg-[#E2875C] text-white flex items-center justify-center font-bold text-sm z-10 shadow-[0_4px_12px_rgba(226,135,92,0.3)]"
                >
                  {item.step}
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-white rounded-2xl p-6 sm:p-8 border border-[#8A9597]/10 hover:border-[#E2875C]/20 hover:shadow-[0_8px_30px_rgba(44,53,57,0.04)] transition-all duration-300"
              >
                <span className="sm:hidden inline-block px-3 py-1 bg-[#E2875C]/10 text-[#E2875C] rounded-full text-xs font-bold mb-3">
                  Paso {item.step}
                </span>
                <h3 className="font-semibold text-xl text-[#2C3539] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#8A9597] leading-relaxed">{item.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
