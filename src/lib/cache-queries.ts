import { cache } from "react";
import { getDepartments as getDepartmentsQuery } from "@/features/departments/queries/get-departments";

export const getCachedDepartments = cache((orgId: string) => {
  return getDepartmentsQuery(orgId);
});
