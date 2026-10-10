import { Outlet, Link } from "react-router";
import { HeaderBrand } from "@/components/common/Header/Header";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border py-6 px-6">
        <Link to="/" className="inline-block">
          <HeaderBrand />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md border border-border rounded-lg bg-card p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
