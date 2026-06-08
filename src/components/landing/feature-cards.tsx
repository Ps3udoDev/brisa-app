"use client";

import { m } from "motion/react";
import { Wallet, Target, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Presupuestos vivos",
    desc: "Asigna fondos a tu equipo y haz seguimiento de cada movimiento en tiempo real.",
    color: "bg-[#E2875C]/10 text-[#E2875C]",
  },
  {
    icon: Target,
    title: "Metas compartidas",
    desc: "Define objetivos de ahorro, vincúlalos a tu equipo y mide el progreso juntos.",
    color: "bg-[#709A73]/10 text-[#709A73]",
  },
  {
    icon: ShieldCheck,
    title: "Deudas bajo control",
    desc: "Organiza tus deudas con el método bola de nieve y liquídalas paso a paso.",
    color: "bg-[#F3C1B6]/30 text-[#7b554c]",
  },
  {
    icon: Zap,
    title: "Notificaciones en tiempo real",
    desc: "Recibe alertas instantáneas cuando tu equipo solicite ajustes de presupuesto.",
    color: "bg-[#E2875C]/10 text-[#E2875C]",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function FeatureCards() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2C3539] mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-[#8A9597] max-w-lg mx-auto">
            Herramientas pensadas para equipos que crecen con orden y
            tranquilidad financiera.
          </p>
        </m.div>

        <m.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <m.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group bg-white rounded-3xl p-6 border border-[#8A9597]/10 hover:border-[#E2875C]/20 hover:shadow-[0_8px_30px_rgba(44,53,57,0.06)] transition-all duration-500"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-[#2C3539] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#8A9597] leading-relaxed">
                {feature.desc}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
