import { useEffect } from "react";
import { useLocation } from "react-router";
import { scrollToSection } from "@/hooks/useScrollToSection";

export function HashScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      const timeout = window.setTimeout(() => scrollToSection(sectionId), 100);
      return () => window.clearTimeout(timeout);
    }
  }, [location.hash, location.pathname]);

  return null;
}
