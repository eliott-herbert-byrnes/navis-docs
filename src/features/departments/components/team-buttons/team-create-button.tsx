"use client";

import { CreateTeamDialog } from "./team-create-dialog";
import { useCreateTeam } from "../../hooks/use-team-mutations";

const CreateTeamButton = ({
  departmentId,
  isAdmin,
}: {
  departmentId: string;
  isAdmin: boolean;
}) => {
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
      disabled={!isAdmin}
    />
  );
};

export { CreateTeamButton };
