"use client";

import { newsCreatePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

const NewsCreateButton = ({
  departmentId,
  teamId,
}: {
  departmentId: string;
  teamId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isAdmin } = useAuthContext();

  const handleCreateNews = () => {
    startTransition(() => {
      router.push(newsCreatePath(departmentId, teamId));
    });
  };
  return (
    <Button variant="outline" disabled={!isAdmin} onClick={handleCreateNews}>
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="w-4 h-4" />
      )}
      Create News
    </Button>
  );
};

export { NewsCreateButton };
