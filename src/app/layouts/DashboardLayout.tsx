import { Outlet, Link } from "react-router";
import { HeaderBrand } from "@/components/common/Header/Header";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <HeaderBrand />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-primary transition-colors">
              Back to Site
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}
