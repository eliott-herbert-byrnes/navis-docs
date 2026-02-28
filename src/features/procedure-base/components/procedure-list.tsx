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
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreVertical,
  TrashIcon,
} from "lucide-react";
import { z } from "zod";
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
import { ProcedureBaseDeleteButton } from "./procedure-base-delete-button";
import { ProcedureBaseDeleteDialog } from "./procedure-base-delete-dialog";
import { useDeleteProceduresFromBase } from "../hook/use-procedure-base-mutations";
import { trpc } from "@/trpc/client";
import { CategoryCell } from "./procedure-list-category-cell";
import { toast } from "sonner";

export const schema = z.object({
  id: z.string(),
  teamId: z.string(),
  slug: z.string(),
  title: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  category: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
    })
    .nullable(),
  team: z
    .object({
      id: z.string(),
      name: z.string(),
      department: z.object({
        id: z.string(),
        name: z.string(),
      }),
    })
    .nullable(),
  createdAt: z.date(),
});

export type Procedure = z.infer<typeof schema>;

function TableCellViewer({
  item,
  categories,
}: {
  item: Procedure;
  categories: { id: string; name: string }[];
}) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
          >
            {item.title}
          </Button>
        </SheetTrigger>
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetHeader className="gap-1">
            <SheetTitle>{item.title}</SheetTitle>
            <SheetDescription>Error Report Details</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto py-4 text-sm mx-4">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Status</Label>
              <Badge variant="outline" className="w-fit">
                {item.status.toLowerCase().charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
              </Badge>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Description</Label>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Department</Label>
              <p className="text-muted-foreground">
                {item.team?.department?.name ?? "—"}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Team</Label>
              <p className="text-muted-foreground">
                {item.team?.name ?? "—"}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Category</Label>
              <CategoryCell procedure={item} categories={categories} />
            </div>

            <Separator />


            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Report Body</Label>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label className="font-semibold">Created At</Label>
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

export function ProcedureList({ data: initialData }: { data: Procedure[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const { deleteProcedures, isPending: isBulkDeletePending } =
    useDeleteProceduresFromBase();

  const teamIds = React.useMemo(
    () => [...new Set(initialData.map((p) => p.teamId))],
    [initialData],
  );
  const { data: categoriesData } =
    trpc.procedures.getCategoriesForTeams.useQuery(
      { teamIds },
      { enabled: teamIds.length > 0 },
    );
  const categoriesByTeam = categoriesData?.categoriesByTeam ?? {};

  const columns: ColumnDef<Procedure>[] = [
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
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <TableCellViewer
          item={row.original}
          categories={categoriesByTeam[row.original.teamId] ?? []}
        />
      ),
      enableHiding: false,
    },
    {
      id: "department",
      accessorFn: (row) => row.team?.department?.name ?? "",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Department
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.team?.department?.name ?? "—"}
        </div>
      ),
    },
    {
      id: "team",
      accessorFn: (row) => row.team?.name ?? "",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Team
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.team?.name ?? "—"}
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Category
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <CategoryCell
          procedure={row.original}
          categories={categoriesByTeam[row.original.teamId] ?? []}
        />
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.status ?? "",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.status.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Created At
          <ArrowUpDown />
        </Button>
      ),
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
              <ProcedureBaseDeleteButton procedureId={row.original.id} />
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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === "ALL") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(value);
    }
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex w-full flex-col gap-4 px-1">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 justify-between gap-4">

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by procedure name..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="pl-10 mr-70"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[125px]">
                <SelectValue placeholder={statusFilter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>

            {selectedCount ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {/* Actions ({selectedCount}) */}
                  {/* <ChevronDown className="h-4 w-4" /> */}
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() => {
                    if (selectedCount === 0) {
                      toast.error(
                        "No procedure selected, please select a valid procedure",
                      );
                      return;
                    }
                    setBulkDeleteOpen(true);
                  }}
                  className="flex gap-4"
                >
                  <TrashIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-normal">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : null}
          </div>

        </div>
      </div>

      <ProcedureBaseDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Are you sure you want to delete ${selectedCount === 1 ? "this procedure" : `${selectedCount} procedures`}?`}
        description="This action cannot be undone."
        onConfirm={() => {
          const ids = table
            .getFilteredSelectedRowModel()
            .rows.map((r) => r.original.id);
          deleteProcedures(ids);
          setRowSelection({});
        }}
        isPending={isBulkDeletePending}
      />

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
                          header.getContext(),
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
                        cell.getContext(),
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
                  No procedures found.
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
