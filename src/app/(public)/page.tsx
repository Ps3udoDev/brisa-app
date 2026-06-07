import {
  Navbar,
  HeroSection,
  FeatureCards,
  HowItWorks,
  CTASection,
  Footer,
} from "@/components/landing";

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
