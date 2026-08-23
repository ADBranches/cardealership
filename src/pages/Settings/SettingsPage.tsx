import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProfileSettingsPanel } from "@/features/profile/components/ProfileSettingsPanel";

export function SettingsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} />Back to home</Link>
        <header className="mb-10"><p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-primary">My Settings</p><h1 className="text-4xl font-bold md:text-5xl">Manage your account</h1><p className="mt-4 max-w-3xl text-muted-foreground">Review verified profile details and prepare secure account updates from one protected workspace.</p></header>
        <ProfileSettingsPanel />
      </div>
    </main>
  );
}
