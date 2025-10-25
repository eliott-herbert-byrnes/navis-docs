import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, ChevronRight, Star, Book, Newspaper } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ProcessSidebarProps = {
  departmentId: string;
  teamId: string;
};

// Mock data - replace with real query
const categories = [
  {
    id: "1",
    name: "Getting Started",
    processes: [
      { id: "1", title: "Onboarding", slug: "onboarding" },
      { id: "2", title: "Setup Guide", slug: "setup-guide" },
    ],
  },
  {
    id: "2",
    name: "HR Policies",
    processes: [
      { id: "3", title: "Leave Request", slug: "leave-request" },
      { id: "4", title: "Expense Claims", slug: "expense-claims" },
    ],
  },
];

export function ProcessSidebar({ departmentId, teamId }: ProcessSidebarProps) {
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
          {/* Favorites Section */}
          <Link
            href={`/departments/${departmentId}/${teamId}/processes/favourites`}
          >
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </Button>
          </Link>
          <Link
            href={`/departments/${departmentId}/${teamId}/processes/address-book`}
          >
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Book className="h-4 w-4" />
              Address Book
            </Button>
          </Link>
          <Link href={`/departments/${departmentId}/${teamId}/processes/News`}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </Button>
          </Link>

          <Separator className="my-2" />

          {/* Categories */}
          {categories.map((category) => (
            <Collapsible key={category.id} defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between group"
                >
                  <span className="font-medium">
                    {category.name}
                    <span className="text-xs text-muted-foreground ml-2">
                      {category.processes.length}
                    </span>
                  </span>

                  <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1">
                {category.processes.map((process) => (
                  <Link
                    key={process.id}
                    href={`/departments/${departmentId}/${teamId}/processes/${process.slug}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                    >
                      {process.title}
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </nav>
    </aside>
  );
}
