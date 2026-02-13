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
import { ProcedureStatus } from "@prisma/client";
import { useState } from "react";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryWithProcedures } from "../types/types";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { cn } from "@/lib/utils";

type ProcedureSidebarProps = {
  isAdmin: boolean;
  uncategorizedProcedures: {
    id: string;
    status: ProcedureStatus;
    slug: string;
    title: string;
  }[];
  categories: CategoryWithProcedures;
};

export function ProcedureSidebar({
  isAdmin,
  uncategorizedProcedures,
  categories,
}: ProcedureSidebarProps) {
  const [open, setOpen] = useState(false);
  const { departmentId, teamId } = useProcedureRouteContext();


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
          </Button>
        </Link>
        <Link href={addressPath(departmentId, teamId)}>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BookOpen className="h-4 w-4" />
            Address Book
          </Button>
        </Link>

        <IdeaButton />

        <Separator className="my-2" />

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
            {categories.filter((category) => category.procedures.length > 0).map((category) => (
              <Collapsible key={category.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group"
                  >
                    <span className="font-medium text-sm">
                      {category.name}
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {category.procedures.map((procedure) => (
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
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(isAdmin ? "w-full justify-start text-sm font-normal hover:bg-accent" : "hidden")}
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
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}

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
      <div className="sm:hidden ">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-7 left-6 bg-background text-foreground sm:hidden rounded-full shadow-lg z-50"
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
      <aside className="hidden sm:flex w-64 border-r bg-background flex-col h-full">
        <div className="p-4 border-b">
          <ProcedureSearchButton />
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
