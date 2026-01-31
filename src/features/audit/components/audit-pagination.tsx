"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AuditPaginationProps = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
};

export function AuditPagination({
  currentPage,
  pageSize,
  totalCount,
}: AuditPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Can navigate?
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Update page number in URL
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Update page size in URL
  const changePageSize = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newSize.toString());
    params.set("page", "1"); // Reset to first page
    router.push(`${pathname}?${params.toString()}`);
  };

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-1">
      {/* Left side: Item range display */}
      <div className="hidden text-sm text-muted-foreground lg:flex">
        Showing {startItem}-{endItem} of {totalCount} audit logs
      </div>

      {/* Center/Right side: Controls */}
      <div className="flex w-full items-center gap-8 lg:w-fit lg:ml-auto">
        {/* Page size selector - hidden on mobile */}
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => changePageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20" id="page-size">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {/* First page button - desktop only */}
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            size="icon"
            onClick={() => goToPage(1)}
            disabled={!canGoPrevious}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            className="h-8 w-8"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Next page button */}
          <Button
            variant="outline"
            className="h-8 w-8"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button - desktop only */}
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={!canGoNext}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
