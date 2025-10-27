"use client";

import { teamProcessCreatePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const ProcessCreateButton = ({
  departmentId,
  teamId,
  isAdmin,
}: {
  departmentId: string;
  teamId: string;
  isAdmin: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
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
