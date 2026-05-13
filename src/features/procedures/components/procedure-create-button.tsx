"use client";

import { teamProcedureCreatePath } from "@/app/paths";
import { AccessButton } from "@/components/ui/access-button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

const ProcedureCreateButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { departmentId, teamId } = useProcedureRouteContext();
  const handleCreateProcedure = () => {
    startTransition(() => {
      router.push(teamProcedureCreatePath(departmentId, teamId));
    });
  };

  return (
    <AccessButton adminOnly variant="outline" onClick={handleCreateProcedure}>
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Procedure
    </AccessButton>
  );
};

export { ProcedureCreateButton };
