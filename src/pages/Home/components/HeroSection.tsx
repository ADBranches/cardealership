import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/hooks/useScrollToSection";

export function HeroSection() {
  return (
    <section className="relative h-screen mt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
      <img
        src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=80"
        alt="Premium Vehicle"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">
            Kampala, Uganda
          </p>
          <h2 className="text-6xl md:text-8xl font-bold mb-6 leading-none text-white">
            DRIVE THE
            <br />
            <span className="text-primary">PEARL OF</span>
            <br />
            AFRICA
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Uganda's premier destination for luxury and 4x4 vehicles. Imported, cleared, and ready
            to conquer Kampala's roads and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => scrollToSection("inventory")}
            >
              EXPLORE STOCK <ChevronRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => scrollToSection("contact")}
            >
              GET A QUOTE
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex h-2">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-[#FCDC04]" />
        <div className="flex-1 bg-[#DE3908]" />
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-[#FCDC04]" />
        <div className="flex-1 bg-[#DE3908]" />
      </div>
    </section>
  );
}
