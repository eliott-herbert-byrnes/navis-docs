"use client";

import Link from "next/link";
import { teamProcessCreatePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const ProcessCreateButton = ({
  departmentId,
  teamId,
  isAdmin,
}: {
  departmentId: string;
  teamId: string;
  isAdmin: boolean;
}) => {
  return (
    <Link href={teamProcessCreatePath(departmentId, teamId)}>
      {isAdmin ? <Button variant="outline" disabled={!isAdmin}>
        <PlusIcon className="w-4 h-4" />
        Create Process
      </Button> : null}
    </Link>
  );
};

export { ProcessCreateButton };
