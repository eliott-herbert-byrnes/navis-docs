"use client";

import { newsCreatePath } from "@/app/paths";
import { AccessButton } from "@/components/ui/access-button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

const NewsCreateButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { departmentId, teamId } = useProcedureRouteContext();

  const handleCreateNews = () => {
    startTransition(() => {
      router.push(newsCreatePath(departmentId, teamId));
    });
  };
  return (
    <AccessButton adminOnly variant="outline" onClick={handleCreateNews}>
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Create News
    </AccessButton>
  );
};

export { NewsCreateButton };
