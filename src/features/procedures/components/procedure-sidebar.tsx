"use client";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Home,
  FileText,
  Newspaper,
  BookOpen,
  Menu,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  addressPath,
  newsPath,
  teamProcedureCreatePath,
  teamProcedurePath,
  viewProcedurePath,
} from "@/app/paths";
import { ProcedureSearchButton } from "./procedure-search-button";
import { IdeaButton } from "./Idea/components/idea-button";
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/server/trpc/routers/_app";
import type { inferProcedureOutput } from "@trpc/server";

type SidebarData = inferProcedureOutput<AppRouter["sidebar"]["getSidebarData"]>;

type ProcedureSidebarProps = {
  isAdmin: boolean;
  initialData: SidebarData;
};

export function ProcedureSidebar({
  isAdmin,
  initialData,
}: ProcedureSidebarProps) {
  const [open, setOpen] = useState(false);
  const { departmentId, teamId } = useProcedureRouteContext();

  const { data } = trpc.sidebar.getSidebarData.useQuery(
    { teamId },
    {
      initialData,
      staleTime: 1000 * 60, // 1 minute — contains user-specific activity data
    },
  );

  const { uncategorizedProcedures, categories, outstanding, unreadNewsCount } =
    data;

  const unreadSet = useMemo(
    () =>
      new Set(
        outstanding.map(
          ({ procedureId, versionId }) => `${procedureId}:${versionId}`,
        ),
      ),
    [outstanding],
  );

  const isProcedureUnread = (
    procedureId: string,
    publishedVersionId: string | null,
  ) =>
    !!publishedVersionId &&
    unreadSet.has(`${procedureId}:${publishedVersionId}`);

  const SidebarContent = () => (
    <nav className="flex-1 overflow-y-auto p-2">
      <div className="space-y-1">
        {/* Navigation Items */}
        <Link href={teamProcedurePath(departmentId, teamId)}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setOpen(false)}
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href={newsPath(departmentId, teamId)}>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Newspaper className="h-4 w-4" />
            News
            {unreadNewsCount > 0 && (
                <>
                  <span
                    className="size-1.5 rounded-full bg-red-700"
                    aria-hidden
                    />
                  <span className="text-muted-foreground text-xs">
                    {unreadNewsCount}
                  </span>
                </>
              )}
          </Button>
        </Link>
        <Link href={addressPath(departmentId, teamId)}>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BookOpen className="h-4 w-4" />
            Address Book
          </Button>
        </Link>

        <IdeaButton />

        <Separator className="my-3 sm:max-w-[250px]" />

        {/* Categories with Procedures */}
        {categories.length === 0 && uncategorizedProcedures.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No procedure yet</p>
            <Link href={teamProcedureCreatePath(departmentId, teamId)}>
              <Button variant="link" size="sm" className="mt-2">
                Create your first procedure
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {categories
              .filter((category) => category.procedures.length > 0)
              .map((category) => {
                const categoryHasUnread = category.procedures.some((p) =>
                  isProcedureUnread(p.id, p.publishedVersionId ?? null),
                );
                return (
                  <Collapsible key={category.id}>
                    <CollapsibleTrigger asChild>
                      <div className="group w-full sm:max-w-[250px]">
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                        >
                          <span className="font-medium text-sm flex items-center gap-1.5">
                            {category.name}
                            {categoryHasUnread && (
                              <span className="text-muted-foreground text-xs ml-2">
                                {
                                  category.procedures.filter((p) =>
                                    isProcedureUnread(
                                      p.id,
                                      p.publishedVersionId ?? null,
                                    ),
                                  ).length
                                }
                              </span>
                            )}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-1">
                      {category.procedures.map((procedure) => {
                        const unread = isProcedureUnread(
                          procedure.id,
                          procedure.publishedVersionId ?? null,
                        );
                        return (
                          <Link
                            key={procedure.id}
                            href={viewProcedurePath(
                              departmentId,
                              teamId,
                              procedure.id,
                            )}
                            className="block"
                          >
                            {procedure.status === "PUBLISHED" ? (
                              <div className="flex flex-row justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-sm font-normal hover:bg-accent gap-1.5"
                                  title={procedure.title}
                                >
                                  <span className="truncate">
                                    {procedure.title.length > 28
                                      ? `${procedure.title.slice(0, 28)}...`
                                      : procedure.title}
                                  </span>
                                </Button>
                                {unread && (
                                  <span
                                    className="absolute size-1.5 shrink-0 rounded-full bg-red-700 left-55 mt-3 cursor-default"
                                    aria-hidden
                                  />
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  isAdmin
                                    ? "w-full justify-start text-sm font-normal hover:bg-accent"
                                    : "hidden",
                                )}
                                title={procedure.title}
                              >
                                <span className="truncate">
                                  {procedure.title.length > 28
                                    ? `${procedure.title.slice(0, 28)} (Draft)...`
                                    : `${procedure.title} (Draft)`}
                                </span>
                              </Button>
                            )}
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

            {/* Uncategorized Procedures */}
            {uncategorizedProcedures.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group"
                  >
                    <span className="font-medium text-sm text-muted-foreground">
                      Uncategorized
                      <span className="text-xs text-muted-foreground ml-2">
                        {uncategorizedProcedures.length}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {uncategorizedProcedures.map((procedure) => (
                    <Link
                      key={procedure.id}
                      href={viewProcedurePath(
                        departmentId,
                        teamId,
                        procedure.id,
                      )}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm font-normal hover:bg-accent"
                        title={procedure.title}
                      >
                        <span className="truncate">
                          {procedure.title.length > 28
                            ? `${procedure.title.slice(0, 28)}...`
                            : procedure.title}
                        </span>
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile: Sheet Drawer */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-7 left-6 text-foreground sm:hidden rounded-full shadow-lg z-50"
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="p-4 border-b">
              <ProcedureSearchButton />
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Regular Sidebar */}
      <aside className="hidden sm:flex col-span-6 lg:col-span-4 bg-background flex-col h-9/10 mt-5">
        {/* <div className="border-b"> */}
          <ProcedureSearchButton />
        {/* </div> */}
        <SidebarContent />
      </aside>
    </>
  );
}
