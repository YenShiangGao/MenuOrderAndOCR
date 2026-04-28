import { HeroSection } from "@/components/site/sections/hero";
import { AboutSection } from "@/components/site/sections/about";
import { SpecialtiesSection } from "@/components/site/sections/specialties";
import { ContactSection } from "@/components/site/sections/contact";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection />
      <ContactSection />
    </>
  );
}
