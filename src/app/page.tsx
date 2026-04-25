import { Hero } from "@/components/hero";
import { SectionPlaceholder } from "@/components/section-placeholder";
import { Sidebar } from "@/components/sidebar";
import { SECTIONS } from "@/lib/sections";

export default function Home() {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-3xl mx-auto px-8 lg:px-16">
          <Hero />
          {SECTIONS.map((section) => (
            <SectionPlaceholder key={section.id} section={section} />
          ))}
        </div>
      </main>
    </>
  );
}
