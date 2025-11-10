"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleCheck,
  Loader2,
  Search,
  Archive,
  Check,
  Eye,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateErrorStatus } from "../actions/update-error-status";
import { viewProcessPath } from "@/app/paths";
import { useRouter } from "next/navigation";
import { ProcessErrorDeleteButton } from "./process-error-delete-button";

export const schema = z.object({
  id: z.string(),
  createdBy: z.string(),
  processName: z.string(),
  category: z.string(),
  status: z.enum(["OPEN", "RESOLVED", "ARCHIVED"]),
  body: z.string(),
  createdAt: z.date(),
  processId: z.string(),
  teamId: z.string(),
  departmentId: z.string(),
});

type ErrorReport = z.infer<typeof schema>;

function TableCellViewer({ item }: { item: ErrorReport }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (status: "RESOLVED" | "ARCHIVED") => {
    setIsUpdating(true);
    const result = await updateErrorStatus(item.id, status);
    setIsUpdating(false);

    if (result.status === "SUCCESS") {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };


  return (
    <div className="w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
          >
            {item.processName}
          </Button>
        </SheetTrigger>
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetHeader className="gap-1">
            <SheetTitle>{item.processName}</SheetTitle>
            <SheetDescription>Error Report Details</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto py-4 text-sm mx-4">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Status</Label>
              <Badge variant="outline" className="w-fit">
                {item.status}
              </Badge>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Created By</Label>
              <p className="text-muted-foreground">{item.createdBy}</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Category</Label>
              <p className="text-muted-foreground">{item.category}</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Report Body</Label>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.body}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Submitted</Label>
              <p className="text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {item.status === "OPEN" && (
              <>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange("RESOLVED")}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("ARCHIVED")}
                    disabled={isUpdating}
                    variant="outline"
                    className="flex-1"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </>
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ProcessErrorList({
  data: initialData,
}: {
  data: ErrorReport[];
}) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const handleStatusUpdate = async (
    errorId: string,
    status: "RESOLVED" | "ARCHIVED"
  ) => {
    const result = await updateErrorStatus(errorId, status);

    if (result.status === "SUCCESS") {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);

    if (value === "ALL") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(value);
    }
  };

  const columns: ColumnDef<ErrorReport>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "processName",
      header: "Process Name",
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.category}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground px-1.5 flex items-center gap-1 w-fit"
          >
            {status === "RESOLVED" ? (
              <CircleCheck className="fill-green-500 dark:fill-green-400 h-4 w-4" />
            ) : status === "ARCHIVED" ? (
              <Archive className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4" />
            )}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <MoreVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link
                href={viewProcessPath(
                  row.original.departmentId,
                  row.original.teamId,
                  row.original.processId
                )}
              >
                <Eye className="ml-1 mr-2 h-4 w-4" />
                View Process
              </Link>
            </DropdownMenuItem>
            {row.original.status === "OPEN" && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusUpdate(row.original.id, "RESOLVED")
                  }
                >
                  <Check className="ml-1 mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusUpdate(row.original.id, "ARCHIVED")
                  }
                >
                  <Archive className="ml-1 mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ProcessErrorDeleteButton errorId={row.original.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex w-full flex-col gap-4 px-1">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by process name..."
            value={
              (table.getColumn("processName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("processName")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[125px]">
            <SelectValue placeholder={statusFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="RESOLVED">Completed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No error reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1 lg:px-1">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
