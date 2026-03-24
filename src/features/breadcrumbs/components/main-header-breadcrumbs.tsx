"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { usePathParse } from "../hooks/use-path-parse";
import { useAuthContext } from "@/contexts/auth-context";
import { trpc } from "@/trpc/client";
import { items } from "@/config/navigation";
import { homePath, teamProcedurePath } from "@/app/paths";

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
        breadcrumbs={[{ id: "home", title: "Home", href: homePath() }]}
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
      id: segment ?? "route",
      title,
      // dropdownGroups: [buildRoutesGroup(), buildDepartmentsGroup()],
      dropdownGroups: [buildRoutesGroup()],
      dropdownAriaLabel: "Switch route",
    };

    return (
      <Breadcrumbs
        breadcrumbs={[
          { id: "home", title: "Home", href: homePath() },
          secondCrumb,
        ]}
      />
    );
  }

  if (parsed.type === "department") {
    const { departmentId, teamId } = parsed;
    const department = departments.find((d) => d.id === departmentId);
    const team = department?.teams.find((t) => t.id === teamId);

    const departmentTitle = departmentsLoading
      ? "…"
      : departmentsError || !department
        ? "Department"
        : department.name;
    const teamTitle = departmentsLoading
      ? "…"
      : departmentsError || !team
        ? "Team"
        : team.name;

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
          { id: "home", title: "Home", href: homePath() },
          departmentCrumb,
          teamCrumb,
        ]}
      />
    );
  }

  return (
    <Breadcrumbs
      breadcrumbs={[{ id: "home", title: "Home", href: homePath() }]}
    />
  );
}
