"use client";
import { Procedure } from "./procedure-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProcedureCategory } from "../hook/use-procedure-base-mutations";

const UNCATEGORIZED_VALUE = "Uncategorized";

export function CategoryCell({
  procedure,
  categories,
}: {
  procedure: Procedure;
  categories: { id: string; name: string }[];
}) {
  const { updateCategory, isPending } = useUpdateProcedureCategory();

  const value = procedure.categoryId ?? "";
  return (
    <div className="w-40">
      <Select
        value={value}
        onValueChange={(newValue) => {
          updateCategory(
            procedure.id,
            newValue === UNCATEGORIZED_VALUE ? null : newValue,
          );
        }}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 text-muted-foreground">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
