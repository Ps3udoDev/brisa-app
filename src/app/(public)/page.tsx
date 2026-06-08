import type { Metadata } from "next";
import {
  CTASection,
  FeatureCards,
  Footer,
  HeroSection,
  HowItWorks,
  Navbar,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "Brisa | Gestion financiera para equipos",
  description:
    "Administra presupuestos, asociados y movimientos financieros de tu equipo desde una sola plataforma.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C3539] font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
