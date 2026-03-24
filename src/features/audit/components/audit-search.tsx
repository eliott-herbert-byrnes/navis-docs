"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuditEntityType } from "../utils/audit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const ENTITY_TYPES: AuditEntityType[] = [
  "DEPARTMENT",
  "TEAM",
  "PROCEDURE",
  "CATEGORY",
  "USER",
];

export const AuditSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [entityType, setEntityType] = useState(
    searchParams.get("entityType") || "",
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate || endDate) {
      return {
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      };
    }
    return undefined;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      let filterChanged = false;

      // Search filter
      const currentSearch = searchParams.get("search");
      if (search) {
        if (search !== currentSearch) filterChanged = true;
        params.set("search", search);
      } else {
        if (currentSearch) filterChanged = true;
        params.delete("search");
      }

      // Entity type filter
      const currentEntityType = searchParams.get("entityType");
      if (entityType && entityType !== "all") {
        if (entityType !== currentEntityType) filterChanged = true;
        params.set("entityType", entityType);
      } else {
        if (currentEntityType) filterChanged = true;
        params.delete("entityType");
      }

      // Date range filter
      const currentStartDate = searchParams.get("startDate");
      const newStartDate = dateRange?.from?.toISOString().split("T")[0];
      if (newStartDate) {
        if (newStartDate !== currentStartDate) filterChanged = true;
        params.set("startDate", newStartDate);
      } else {
        if (currentStartDate) filterChanged = true;
        params.delete("startDate");
      }

      const currentEndDate = searchParams.get("endDate");
      const newEndDate = dateRange?.to?.toISOString().split("T")[0];
      if (newEndDate) {
        if (newEndDate !== currentEndDate) filterChanged = true;
        params.set("endDate", newEndDate);
      } else {
        if (currentEndDate) filterChanged = true;
        params.delete("endDate");
      }

      if (filterChanged) {
        params.set("page", "1");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams, entityType, dateRange]);

  return (
    <div className="relative w-full flex items-center gap-2 justify-between">
      <div>
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 shadow-none border w-80"
          disabled={isPending}
        />
      </div>

      {/* filter */}
      <div className="flex items-center gap-2">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          disabled={isPending}
        />

        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-30 shadow-none">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
