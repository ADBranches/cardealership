import { ArrowUp, MessageCircle } from "lucide-react";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export function FloatingActions() {
  const { showWhatsApp, showBackToTop, scrollToTop } = useScrollVisibility();

  return (
    <>
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/80 transition-all duration-300 hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {showWhatsApp && (
        <a
          href="https://wa.me/256770826951?text=Hello%20Panda%20Motors%2C%20I'm%20interested%20in%20a%20vehicle%20from%20your%20showroom"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-pulse"
          aria-label="Contact on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </>
  );
}
