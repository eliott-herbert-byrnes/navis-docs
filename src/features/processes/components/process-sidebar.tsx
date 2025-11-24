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
  teamProcessCreatePath,
  teamProcessPath,
  viewProcessPath,
} from "@/app/paths";
import { CategoryWithProcesses } from "../queries/get-categories-with-processes";
import { ProcessSearchButton } from "./process-search-button";
import { IdeaButton } from "./Idea/components/idea-button";
import { ProcessStatus } from "@prisma/client";
import { useState } from "react";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

type ProcessSidebarProps = {
  departmentId: string;
  teamId: string;
  uncategorizedProcesses: {
    id: string;
    status: ProcessStatus;
    slug: string;
    title: string;
  }[];
  categories: CategoryWithProcesses[];
};

export function ProcessSidebar({
  departmentId,
  teamId,
  uncategorizedProcesses,
  categories,
}: ProcessSidebarProps) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <nav className="flex-1 overflow-y-auto p-2">
      <div className="space-y-1">
        {/* All your existing navigation items */}
        <Link href={teamProcessPath(departmentId, teamId)}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setOpen(false)}
          >
            <Home className="h-4 w-4" />
            Processes Home
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
            Addresses
          </Button>
        </Link>

        <IdeaButton teamId={teamId} />

        <Separator className="my-2" />

        {/* Categories with Processes */}
        {categories.length === 0 && uncategorizedProcesses.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No processes yet</p>
            <Link href={teamProcessCreatePath(departmentId, teamId)}>
              <Button variant="link" size="sm" className="mt-2">
                Create your first process
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <Collapsible key={category.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group"
                  >
                    <span className="font-medium text-sm">
                      {category.name}
                      {/* <span className="text-xs text-muted-foreground ml-2">
                          {category.processes.length}
                        </span> */}
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {category.processes.map((process) => (
                    <Link
                      key={process.id}
                      href={viewProcessPath(departmentId, teamId, process.id)}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm font-normal hover:bg-accent"
                        title={process.title}
                      >
                        <span className="truncate">
                          {process.title.length > 28
                            ? `${process.title.slice(0, 28)}...`
                            : process.title}
                        </span>
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Uncategorized Processes */}
            {uncategorizedProcesses.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group"
                  >
                    <span className="font-medium text-sm text-muted-foreground">
                      Uncategorized
                      <span className="text-xs text-muted-foreground ml-2">
                        {uncategorizedProcesses.length}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {uncategorizedProcesses.map((process) => (
                    <Link
                      key={process.id}
                      href={viewProcessPath(departmentId, teamId, process.id)}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm font-normal hover:bg-accent"
                        title={process.title}
                      >
                        <span className="truncate">
                          {process.title.length > 28
                            ? `${process.title.slice(0, 28)}...`
                            : process.title}
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
              <ProcessSearchButton
                departmentId={departmentId}
                teamId={teamId}
              />
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Regular Sidebar */}
      <aside className="hidden sm:flex w-64 border-r bg-background flex-col h-full">
        <div className="p-4 border-b">
          <ProcessSearchButton departmentId={departmentId} teamId={teamId} />
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
