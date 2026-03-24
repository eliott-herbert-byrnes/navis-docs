import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { procedureBasePath } from "@/app/paths";
import { CreateProcedureForm } from "@/features/procedures/components/procedure-create-form";

export default async function ProcedureBaseCreatePage() {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org || !isAdmin) redirect(procedureBasePath());

  return (
    <>
      <Heading title="Create Procedure" description="Create a new procedure and assign it to a department and team." />
      <CreateProcedureForm
        categories={[]}            
        cancelPath={procedureBasePath()}
        redirectOnSuccess={true}   
      />
    </>
  );
}