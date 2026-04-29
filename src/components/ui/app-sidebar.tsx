import { getSessionContext } from "@/lib/auth";
import { AppSidebarClient } from "@/components/ui/app-sidebar-client";
import { isDemoContext } from "@/lib/demo";

export async function AppSidebar() {
  const ctx = await getSessionContext();
  if (!ctx) return <div className="h-full invisible" aria-hidden />;
  const { isAdmin } = ctx;
  const isDemo = await isDemoContext();
  return <AppSidebarClient isAdmin={isAdmin} isDemo={isDemo} />;
}
