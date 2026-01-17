"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useState } from "react";

export function useCreateDepartment() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = trpc.department.create.useMutation({
    onSuccess: () => {
      utils.department.list.invalidate();
      toast.success("Department created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createDepartment = (
    departmentName: string,
    teamName1: string,
    teamName2?: string,
    teamName3?: string,
  ) => {
    mutation.mutate({
      departmentName,
      teamName1,
      teamName2: teamName2 || "",
      teamName3: teamName3 || "",
    });
  };

  return {
    createDepartment,
    isPending: mutation.isPending,
    isDialogOpen,
    setIsDialogOpen,
  };
}

export function useDeleteDepartment() {
  const utils = trpc.useUtils();

  const mutation = trpc.department.delete.useMutation({
    onSuccess: () => {
      utils.department.list.invalidate();
      toast.success("Department deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteDepartment = (input: {
    departmentId: string;
    departmentName: string;
  }) => {
    mutation.mutate(input);
  };

  return {
    deleteDepartment,
    isPending: mutation.isPending,
  };
}

export function useRenameDepartment() {
  const utils = trpc.useUtils();
  const mutation = trpc.department.rename.useMutation({
    onSuccess: () => {
      utils.department.list.invalidate();
      toast.success("Department renamed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const renameDepartment = (
    departmentId: string,
    oldDepartmentName: string,
    newDepartmentName: string,
  ) => {
    mutation.mutate({
      departmentId,
      oldDepartmentName,
      newDepartmentName,
    });
  };

  return {
    renameDepartment,
    isPending: mutation.isPending,
  };
}
