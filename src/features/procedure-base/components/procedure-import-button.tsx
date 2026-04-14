"use client";

import { procedureBaseImportPath } from "@/app/paths";
import { AccessButton } from "@/components/ui/access-button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const ProcedureImportButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleCreateProcedure = () => {
    startTransition(() => {
      router.push(procedureBaseImportPath());
    });
  };

  return (
    <AccessButton adminOnly variant="outline" onClick={handleCreateProcedure}>
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Import Procedure
    </AccessButton>
  );
};

export { ProcedureImportButton };
