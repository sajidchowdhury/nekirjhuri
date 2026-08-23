import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { Concept } from "@/components/sections/concept";
import { SuccessVision } from "@/components/sections/success-vision";
import { Policy } from "@/components/sections/policy";
import { UmmahNeeds } from "@/components/sections/ummah-needs";
import { DevelopingStory } from "@/components/sections/developing-story";
import { FixedProjects } from "@/components/sections/fixed-projects";
import { ModulesFunnel } from "@/components/sections/modules-funnel";
import { DonateCta } from "@/components/sections/donate-cta";
import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Concept />
        <SuccessVision />
        <Policy />
        <UmmahNeeds />
        <DevelopingStory />
        <FixedProjects />
        <ModulesFunnel />
        <DonateCta />
      </main>
      <SiteFooter />
    </div>
  );
}
