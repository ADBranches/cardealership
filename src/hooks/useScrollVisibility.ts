import { useEffect, useState } from "react";

interface ScrollVisibilityOptions {
  whatsAppThreshold?: number;
  backToTopThreshold?: number;
}

export function useScrollVisibility(options: ScrollVisibilityOptions = {}) {
  const { whatsAppThreshold = 300, backToTopThreshold = 500 } = options;
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowWhatsApp(window.scrollY > whatsAppThreshold);
      setShowBackToTop(window.scrollY > backToTopThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [whatsAppThreshold, backToTopThreshold]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return { showWhatsApp, showBackToTop, scrollToTop };
}
