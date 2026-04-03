import { Heading } from "@/components/ui/Heading";
import { ProcedureList } from "@/features/procedure-base/components/procedure-list";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { ExportProcedureOrgDataButton } from "@/features/settings/components/export-procedure-org-data-button";
import { getSessionContext } from "@/lib/auth";
import { onboardingPath, homePath, procedureBaseCreatePath } from "@/app/paths";
import { redirect } from "next/navigation";
import { serverTrpc } from "@/server/trpc/server";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, PlusIcon } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ProcedureBasePage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const trpc = await serverTrpc();
  const proceduresResult = await trpc.procedures.getProceduresForBase({
    search: "",
    limit: 10,
    offset: 0,
  });
  const data = proceduresResult;


  const createProcedureButton = (
    <Button variant="ghost" className="flex justify-start p-0 rounded-none">
      <Link href={procedureBaseCreatePath()} className="ml-1 cursor-default">
        <div className="flex flex-row gap-2 items-center">
          <PlusIcon className="w-4 h-4" />
          Create Procedure
        </div>
      </Link>
    </Button>
  )

  const dropdownButtons = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Actions <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col p-0 m-0 gap-1">
        <DropdownMenuItem asChild>
          {createProcedureButton}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ExportProcedureOrgDataButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
      <PageContainer>
        <Heading
          title="Procedures"
          description="View and manage procedures for your organization"
          actions={
            <div className="flex flex-col gap-2">
              {/* Disabled for MVP */}
              {/* <ProcedureImportButton /> */}
              {dropdownButtons}
            </div>
          }
        />
        <Suspense fallback={<ListSkeleton />}>
          <ProcedureList initialData={data} />
        </Suspense>
      </PageContainer>
  );
};

export default ProcedureBasePage;
