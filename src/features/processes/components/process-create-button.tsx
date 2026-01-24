"use client";

import { teamProcessCreatePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useProcessRouteContext } from "@/contexts/process-route-context";

const ProcessCreateButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isAdmin } = useAuthContext();
  const { departmentId, teamId } = useProcessRouteContext();
  const handleCreateProcess = () => {
    startTransition(() => {
      router.push(teamProcessCreatePath(departmentId, teamId));
    });
  };

  return (
    <Button variant="outline" disabled={!isAdmin} onClick={handleCreateProcess}>
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Create Process
    </Button>
  );
};

export { ProcessCreateButton };
