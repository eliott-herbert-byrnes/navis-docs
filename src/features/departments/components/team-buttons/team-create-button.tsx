"use client";

import { CreateTeamDialog } from "./team-create-dialog";
import { useCreateTeam } from "../../hooks/use-team-mutations";
const CreateTeamButton = ({ departmentId }: { departmentId: string }) => {
  const { createTeam, isPending, isDialogOpen, setIsDialogOpen } =
    useCreateTeam();

  const handleCreateTeam = (teamName: string) => {
    createTeam(departmentId, teamName);
  };

  return (
    <CreateTeamDialog
      title="Add Team"
      description="Add a new team to the department"
      onConfirm={handleCreateTeam}
      isPending={isPending}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
  );
};

export { CreateTeamButton };
