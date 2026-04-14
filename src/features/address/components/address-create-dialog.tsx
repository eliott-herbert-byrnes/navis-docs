"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCreateAddress } from "../hook/use-address-mutations";
import { AccessDialogTrigger } from "@/components/ui/access-button";

type AddressCreateDialogProps = {
  title: string;
  description: string;
};

const AddressCreateDialog = ({
  title,
  description,
}: AddressCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const { createAddress, isPending } = useCreateAddress(() => setOpen(false));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createAddress({
      name: String(formData.get("name") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger adminOnly>
        <Button className="flex items-center gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2 py-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Address name"
                maxLength={100}
                required
                disabled={isPending}
                className="shadow-none border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                maxLength={255}
                required
                disabled={isPending}
                className="shadow-none border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Phone number"
                maxLength={20}
                disabled={isPending}
                className="shadow-none border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Email address"
                type="email"
                disabled={isPending}
                className="shadow-none border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://navisdocs.com"
                disabled={isPending}
                className="shadow-none border"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 pt-2">
            <Button
              type="submit"
              isLoading={isPending}
              className="shadow-none border"
            >
              Create
            </Button>
            <Button
              className="w-[75px] shadow-none border"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddressCreateDialog };
