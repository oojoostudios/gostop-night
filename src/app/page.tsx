import { Hero } from "@/components/hero";
import { MobileTopbar } from "@/components/mobile-topbar";
import { SectionCards } from "@/components/section-cards";
import { SectionFlow } from "@/components/section-flow";
import { SectionGoStop } from "@/components/section-gostop";
import { SectionScoring } from "@/components/section-scoring";
import { SectionSpecial } from "@/components/section-special";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <>
      <MobileTopbar />
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <Hero />
          <SectionCards />
          <SectionFlow />
          <SectionScoring />
          <SectionSpecial />
          <SectionGoStop />
        </div>
      </main>
    </>
  );
}
