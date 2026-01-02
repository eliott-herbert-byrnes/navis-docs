"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useState } from "react";

export function useDeleteTeam() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = trpc.team.delete.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Team deleted successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTeam = (departmentId: string, teamName: string) => {
    mutation.mutate({ departmentId, teamName });
  };

  return {
    deleteTeam,
    isPending: mutation.isPending,
    isDialogOpen,
    setIsDialogOpen,
  };
}

export function useCreateTeam() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = trpc.team.create.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Team created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
        toast.error(error.message);
      },
  });

  const createTeam = (departmentId: string, teamName: string) => {
    mutation.mutate({ departmentId, teamName });
  };

  return {
    createTeam,
    isPending: mutation.isPending,
    isDialogOpen,
    setIsDialogOpen,
  };
}

export function useRenameTeam() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = trpc.team.rename.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      utils.department.list.invalidate();
      toast.success("Team renamed successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
        toast.error(error.message);
      },
  });

  const renameTeam = (
    departmentId: string,
    oldTeamName: string,
    newTeamName: string
  ) => {
    mutation.mutate({ departmentId, oldTeamName, newTeamName });
  };

  return {
    renameTeam,
    isPending: mutation.isPending,
    isDialogOpen,
    setIsDialogOpen,
  };
}
