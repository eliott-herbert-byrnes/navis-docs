import { Suspense } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AsyncAuthContextLoader } from "@/contexts/async-auth-context-loader";
import { MainHeaderBreadcrumbs } from "@/features/breadcrumbs/components/main-header-breadcrumbs";
import { OrgBadge } from "@/features/org/components/org-badge";

function SidebarFallback() {
  return (
    <div className="hidden md:flex w-14 shrink-0 flex-col gap-2 border-r px-2 py-3">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="mt-auto">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

function ContentAreaFallback() {
  return (
    <div className="flex h-full w-full flex-col pl-4 pr-4">
      <div className="flex flex-row items-center justify-between pt-5 px-8">
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="h-8 w-8 sm:hidden" />
          <Skeleton className="h-6 w-56 hidden md:block" />
        </div>
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="grid grid-cols-12 gap-x-4 pt-12 px-6">
        <div className="col-span-8 col-start-3 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Suspense fallback={<SidebarFallback />}>
        <AppSidebar/>
      </Suspense>
      <SidebarInset className="">
        <div className="flex flex-row h-full">
          <Suspense fallback={<ContentAreaFallback />}>
            <AsyncAuthContextLoader>
              <div className="flex h-full w-full flex-col sm:pl-4 sm:pr-4">
                <div className="flex flex-row items-center justify-between pt-6.5 px-4 sm:px-8">
                  <div className="flex flex-row items-center gap-2">
                    <div className="sm:hidden">
                      <SidebarTrigger />
                    </div>
                    <div className="hidden md:inline">
                      <MainHeaderBreadcrumbs />
                    </div>
                  </div>
                  <Suspense fallback={<Skeleton className="h-6 w-28" />}>
                    <OrgBadge />
                  </Suspense>
                </div>
                <div className="flex flex-col w-full min-w-0 sm:grid sm:grid-cols-24 gap-x-4 pt-10 px-6 ">
                  {children}
                </div>
              </div>
            </AsyncAuthContextLoader>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
