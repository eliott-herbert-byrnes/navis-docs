import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, ChevronRight, Star, Home, FileText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { teamProcessCreatePath, teamProcessPath, processPath } from "@/app/paths";
import { getCategoriesWithProcesses } from "../queries/get-categories-with-processes";
import { prisma } from "@/lib/prisma";

type ProcessSidebarProps = {
  departmentId: string;
  teamId: string;
};

export async function ProcessSidebar({ departmentId, teamId }: ProcessSidebarProps) {
  const categories = await getCategoriesWithProcesses(teamId);
  
  const uncategorizedProcesses = await prisma.process.findMany({
    where: {
      teamId,
      categoryId: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const totalProcesses = 
    categories.reduce((sum, cat) => sum + cat.processes.length, 0) + 
    uncategorizedProcesses.length;
  return (
    <aside className="w-64 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search processes..." className="pl-8" />
        </div>
      </div>

      {/* Content */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* Quick Links */}
          <Link href={teamProcessPath(departmentId, teamId)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-4 w-4" />
              Processes Home
            </Button>
          </Link>
          
          <Link href={`${teamProcessPath(departmentId, teamId)}?view=favorites`}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </Button>
          </Link>

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
                <Collapsible key={category.id} defaultOpen>
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
                        href={processPath(departmentId, teamId, process.slug)}
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
                <Collapsible defaultOpen>
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
                        href={processPath(departmentId, teamId, process.slug)}
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
    </aside>
  );
}
