"use client";

import { teamProcedureCreatePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

const ProcedureCreateButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isAdmin } = useAuthContext();
  const { departmentId, teamId } = useProcedureRouteContext();
  const handleCreateProcedure = () => {
    startTransition(() => {
      router.push(teamProcedureCreatePath(departmentId, teamId));
    });
  };

  return (
    <Button
      variant="outline"
      disabled={!isAdmin}
      onClick={handleCreateProcedure}
    >
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Create Procedure
    </Button>
  );
};

export { ProcedureCreateButton };
