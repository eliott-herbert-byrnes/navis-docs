"use client";

import { procedureBaseImportPath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

const ProcedureImportButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isAdmin } = useAuthContext();
  const handleCreateProcedure = () => {
    startTransition(() => {
      router.push(procedureBaseImportPath());
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
      Import Procedure
    </Button>
  );
};

export { ProcedureImportButton };
