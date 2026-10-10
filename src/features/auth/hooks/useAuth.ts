import { useAuthContext } from "@/app/context/auth";

export function useAuth() {
  return useAuthContext();
}
