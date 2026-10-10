import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/hooks/useScrollToSection";
import { Link, useLocation } from "react-router";

interface NavbarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const navItems = [
  { label: "INVENTORY", section: "inventory" },
  { label: "SERVICES", section: "services" },
  { label: "ABOUT", section: "about" },
  { label: "CONTACT", section: "contact" },
] as const;

export function Navbar({ mobileMenuOpen, onToggleMobileMenu }: NavbarProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const closeMobileMenuIfOpen = () => {
    if (mobileMenuOpen) {
      onToggleMobileMenu();
    }
  };

  const handleNavClick = (section: string) => {
    closeMobileMenuIfOpen();
    if (isHome) {
      scrollToSection(section);
      return;
    }
    window.location.href = `/#${section}`;
  };

  return (
    <>
      <nav className="hidden md:flex items-center space-x-8">
        {navItems.map((item) => (
          <button
            key={item.section}
            type="button"
            onClick={() => handleNavClick(item.section)}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {item.label}
          </button>
        ))}
        <Button
          className="bg-primary text-white hover:bg-primary/90"
          onClick={() => {
            if (isHome) {
              scrollToSection("test-drive");
              return;
            }
            window.location.href = "/#test-drive";
          }}
        >
          BOOK TEST DRIVE
        </Button>
        <Link
          to="/login"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          SIGN IN
        </Link>
      </nav>

      <button className="md:hidden p-2" onClick={onToggleMobileMenu}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => handleNavClick(item.section)}
              className="block w-full text-left text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            onClick={() => handleNavClick("test-drive")}
          >
            BOOK TEST DRIVE
          </Button>
          <Link
            to="/login"
            className="block text-sm font-medium hover:text-primary transition-colors"
            onClick={closeMobileMenuIfOpen}
          >
            SIGN IN
          </Link>
        </div>
      )}
    </>
  );
}
