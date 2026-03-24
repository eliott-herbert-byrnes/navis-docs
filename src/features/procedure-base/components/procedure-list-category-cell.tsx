"use client";
import { Procedure } from "./procedure-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

  const selectedCategoryName =
    categories.find((c) => c.id === value)?.name ?? "";

  const truncatedCategoryName =
    selectedCategoryName.length > 14
      ? `${selectedCategoryName.slice(0, 14)}...`
      : selectedCategoryName;

  return (
    <div className="max-w-40">
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
        <SelectTrigger className="h-8 text-muted-foreground  shadow-none border truncate max-w-40 w-40">
          <span className={!value ? "text-muted-foreground/60" : ""}>
            {value ? truncatedCategoryName : "Category"}
          </span>
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
