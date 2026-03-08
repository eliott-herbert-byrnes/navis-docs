import { Suspense } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { AuthProvider } from "@/contexts/auth-context";
import { MainHeaderBreadcrumbs } from "@/features/breadcrumbs/components/main-header-breadcrumbs";
import { OrgBadge } from "@/features/org/components/org-badge";

function LayoutFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export async function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    return <>{children}</>;
  }

  const { org, isAdmin } = await getUserOrgWithRole(user.userId);

  if (!org) {
    return <>{children}</>;
  }

  return (
    <AuthProvider isAdmin={isAdmin} userId={user.userId}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="p-2">
          <div className="flex flex-row h-full">
            <div className="flex h-full w-full flex-col rounded-sm pl-4 pr-4 pt-2">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  <div className="sm:hidden">
                    <SidebarTrigger />
                  </div>
                  <div className="hidden md:inline">
                    <MainHeaderBreadcrumbs />
                  </div>
                </div>
                <OrgBadge />
              </div>
              <Separator className="mt-2" />
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}

export function AuthenticatedLayoutWithSuspense({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutFallback />}>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </Suspense>
  );
}
