"use client";

import { TeamRenameDialog } from "./team-rename-dialog";
import { useRenameTeam } from "../../hooks/use-team-mutations";

const TeamRenameButton = ({
  departmentId,
  teamName,
}: {
  departmentId: string;
  teamName: string;
}) => {
  const { renameTeam, isPending, isDialogOpen, setIsDialogOpen } =
    useRenameTeam();

  const handleRenameTeam = (newTeamName: string) => {
    renameTeam(departmentId, teamName, newTeamName);
  };

  return (
    <TeamRenameDialog
      title="Are you sure you want to rename this team?"
      description="This action will rename the team and all associated documents will be updated."
      onConfirm={handleRenameTeam}
      isPending={isPending}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      teamName={teamName}
    />
  );
};

export { TeamRenameButton };
