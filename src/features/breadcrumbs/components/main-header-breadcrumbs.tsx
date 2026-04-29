"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePathParse } from "../hooks/use-path-parse";
import { useAuthContext } from "@/contexts/auth-context";
import { trpc } from "@/trpc/client";
import { items } from "@/config/navigation";
import { dashboardPath, teamProcedurePath } from "@/app/paths";
import { Skeleton } from "@/components/ui/skeleton";

export function MainHeaderBreadcrumbs() {
  const parsed = usePathParse();
  const { isAdmin } = useAuthContext();
  const {
    data: departmentData,
    isLoading: departmentsLoading,
    isError: departmentsError,
  } = trpc.department.list.useQuery();

  const departments = departmentData?.list ?? [];

  function buildRoutesGroup() {
    const routeItems = items
      .filter((item) => isAdmin || !("isAdmin" in item && item.isAdmin))
      .map((item) => ({
        id: item.id,
        title: item.title,
        href: item.path,
      }));
    return { label: "Pages", items: routeItems };
  }

  function buildDepartmentsGroup() {
    const departmentItems = departments.map((dept) => ({
      id: dept.id,
      title: dept.name,
      href:
        dept.teams.length > 0
          ? teamProcedurePath(dept.id, dept.teams[0].id)
          : `/departments/${dept.id}`,
    }));
    return { label: "Departments", items: departmentItems };
  }

  if (parsed.type === "home") {
    return (
      <Breadcrumbs
        breadcrumbs={[{ id: "home", title: "Home", href: dashboardPath() }]}
      />
    );
  }

  if (parsed.type === "org-route") {
    const segment = "segment" in parsed ? parsed.segment : undefined;
    const matched = segment
      ? items.find((item) => item.id === segment)
      : undefined;
    const title = matched?.title ?? segment ?? "Route";

    const secondCrumb = {
      // Prefix so this never collides with the root crumb id "home" when segment === "home"
      id: segment != null ? `segment-${segment}` : "route",
      title,
      // dropdownGroups: [buildRoutesGroup(), buildDepartmentsGroup()],
      dropdownGroups: [buildRoutesGroup()],
      dropdownAriaLabel: "Switch route",
    };

    return (
      <Breadcrumbs
        breadcrumbs={[
          { id: "home", title: "Home", href: dashboardPath() },
          secondCrumb,
        ]}
      />
    );
  }

  if (parsed.type === "department") {
    const { departmentId, teamId } = parsed;
    const department = departments.find((d) => d.id === departmentId);
    const team = department?.teams.find((t) => t.id === teamId);

    const departmentTitle = departmentsLoading ? (
      <Skeleton className="inline-block h-4 w-20 align-middle" />
    ) : departmentsError || !department ? (
      "Department"
    ) : (
      department.name
    );
    const teamTitle = departmentsLoading ? (
      <Skeleton className="inline-block h-4 w-20 align-middle" />
    ) : departmentsError || !team ? (
      "Team"
    ) : (
      team.name
    );

    const departmentCrumb = {
      id: departmentId,
      title: departmentTitle,
      dropdownGroups: [buildRoutesGroup(), buildDepartmentsGroup()],
      dropdownAriaLabel: "Switch department",
    };

    const teamDropdownItems =
      department?.teams.map((t) => ({
        id: t.id,
        title: t.name,
        href: teamProcedurePath(departmentId, t.id),
      })) ?? [];

    const teamCrumb = {
      id: teamId,
      title: teamTitle,
      dropdown: teamDropdownItems,
      dropdownAriaLabel: "Switch team",
    };

    return (
      <Breadcrumbs
        breadcrumbs={[
          { id: "home", title: "Home", href: dashboardPath() },
          departmentCrumb,
          teamCrumb,
        ]}
      />
    );
  }

  return (
    <Breadcrumbs
      breadcrumbs={[{ id: "home", title: "Home", href: dashboardPath() }]}
    />
  );
}
