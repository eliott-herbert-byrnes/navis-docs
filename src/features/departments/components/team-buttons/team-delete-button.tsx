"use client";

import { TeamDeleteDialog } from "./team-delete-dialog";
import { useDeleteTeam } from "../../hooks/use-team-mutations";

const TeamDeleteButton = ({
  departmentId,
  teamName,
}: {
  departmentId: string;
  teamName: string;
  onSuccess?: () => void;
}) => {
  const { deleteTeam, isPending, isDialogOpen, setIsDialogOpen } =
    useDeleteTeam();

  const handleDelete = () => {
    deleteTeam(departmentId, teamName);
  };

  return (
    <TeamDeleteDialog
      title="Are you sure you want to delete this team?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
  );
};

export { TeamDeleteButton };
