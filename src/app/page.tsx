import { HeroSection } from "@/components/dashboard/HeroSection";
import { JourneyStrip } from "@/components/dashboard/JourneyStrip";
import { PhaseShowcase } from "@/components/dashboard/PhaseShowcase";
import { QuickStats } from "@/components/dashboard/QuickStats";

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuickStats />
      <JourneyStrip />
      <PhaseShowcase />
    </>
  );
}
