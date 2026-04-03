import { getSessionContext } from "@/lib/auth";
import { AppSidebarClient } from "@/components/ui/app-sidebar-client";

export async function AppSidebar() {
  const ctx = await getSessionContext();
  if (!ctx) return <div className="h-full invisible" aria-hidden />;
  const { isAdmin } = ctx;
  return <AppSidebarClient isAdmin={isAdmin} />;
}
