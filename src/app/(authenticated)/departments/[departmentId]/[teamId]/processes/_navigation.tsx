"use client";
import { useParams } from "next/navigation";
import {
  homePath,
} from "@/app/paths";
import { Breadcrumbs } from "@/components/breadcrumbs";

type ProcessBreadcrumbsProps = {
  teamName?: string;
  departmentName?: string;
};

const ProcessBreadcrumbs = ({
  teamName,
  departmentName,
}: ProcessBreadcrumbsProps) => {

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

export { ProcessBreadcrumbs };