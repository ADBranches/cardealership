import { useState } from "react";
import { Outlet } from "react-router";
import { HeaderBrand } from "@/components/common/Header/Header";
import { Navbar } from "@/components/common/Navbar/Navbar";
import { Footer } from "@/components/common/Footer/Footer";
import { FloatingActions } from "@/components/common/FloatingActions/FloatingActions";
import { HashScrollHandler } from "@/app/providers/HashScrollHandler";

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HashScrollHandler />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            <HeaderBrand />
            <Navbar
              mobileMenuOpen={mobileMenuOpen}
              onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
            />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}
