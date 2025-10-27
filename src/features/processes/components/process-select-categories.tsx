import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProcessSelectCategoriesProps = {
    categories: {id: string, name: string}[];
    name?: string;
    isDisabled?: boolean;
}

const ProcessSelectCategories = ({categories, name = "ProcessCategoryId", isDisabled} : ProcessSelectCategoriesProps) => {
    if (categories.length === 0) {
        return (
            <Select name={name} disabled>
                <SelectTrigger>
                    <SelectValue placeholder="No categories available" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" disabled>
                        Create a category first
                    </SelectItem>
                </SelectContent>
            </Select>
        )
    }

    return (
        <Select name={name} disabled={isDisabled} value={isDisabled ? "" : undefined}>
            <SelectTrigger>
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
    )
}

export { ProcessSelectCategories };