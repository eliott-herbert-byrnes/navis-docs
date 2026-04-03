import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProcedureSelectCategoriesProps = {
  categories: { id: string; name: string }[];
  name?: string;
  isDisabled?: boolean;
};

const ProcedureSelectCategories = ({
  categories,
  name = "ProcedureCategoryId",
  isDisabled,
}: ProcedureSelectCategoriesProps) => {
  if (categories.length === 0) {
    return (
      <Select name={name} disabled>
        <SelectTrigger className="shadow-none border max-w-1/3">
          <SelectValue placeholder="No categories available" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" disabled>
            Create a category first
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select
      name={name}
      disabled={isDisabled}
      value={isDisabled ? "" : undefined}
    >
      <SelectTrigger className="shadow-none border max-w-1/3">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { ProcedureSelectCategories };
