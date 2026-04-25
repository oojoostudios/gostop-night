import { Hero } from "@/components/hero";
import { MobileTopbar } from "@/components/mobile-topbar";
import { SectionCards } from "@/components/section-cards";
import { SectionPlaceholder } from "@/components/section-placeholder";
import { Sidebar } from "@/components/sidebar";
import { SECTIONS } from "@/lib/sections";

export default function Home() {
  return (
    <>
      <MobileTopbar />
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">
          <Hero />
          <SectionCards />
          {SECTIONS.filter((s) => s.id !== "section-cards").map((section) => (
            <SectionPlaceholder key={section.id} section={section} />
          ))}
        </div>
      </main>
    </>
  );
}
