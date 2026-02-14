"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useCreateAddress(onSuccessCallback?: () => void) {
  const utils = trpc.useUtils();

  const mutation = trpc.address.createAddress.useMutation({
    onSuccess: () => {
      utils.address.listAddress.invalidate();
      toast.success("Address created");
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to create address, try again or contact support",
      );
    },
  });

  const createAddress = (data: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  }) => {
    mutation.mutate({ ...data });
  };

  return {
    createAddress,
    isPending: mutation.isPending,
  };
}

export function useDeleteAddress() {
  const utils = trpc.useUtils();

  const mutation = trpc.address.addressDelete.useMutation({
    onSuccess: () => {
      utils.address.listAddress.invalidate();
      toast.success("Address deleted");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete address, try again or contact support",
      );
    },
  });

  const deleteAddress = (addressId: string) => {
    mutation.mutate({ addressId });
  };

  return {
    deleteAddress,
    isPending: mutation.isPending,
  };
}
