import { useContext } from "react";
import { AdminChatContext } from "../context/AdminChatContext";

export function useAdminChat() {
  const context = useContext(AdminChatContext);
  if (!context) {
    throw new Error("useAdminChat must be used within AdminChatProvider");
  }
  return context;
}
