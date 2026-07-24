import { HashScrollHandler } from "./HashScrollHandler";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      <HashScrollHandler />
      {children}
    </>
  );
}
