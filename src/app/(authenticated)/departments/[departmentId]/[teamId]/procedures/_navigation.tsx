"use client";
import { homePath } from "@/app/paths";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

type ProcedureBreadcrumbsProps = {
  teamName?: string;
  departmentName?: string;
};

const ProcedureBreadcrumbs = ({
  teamName,
  departmentName,
}: ProcedureBreadcrumbsProps) => {
  if (!departmentName || !teamName) {
    return null;
  }

  return (
    <Breadcrumbs
      breadcrumbs={[
        { title: "Home", href: homePath() },
        { title: departmentName },
        { title: teamName },
      ]}
    />
  );
};

export { ProcedureBreadcrumbs };
