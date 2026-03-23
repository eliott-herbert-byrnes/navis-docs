"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, TrashIcon } from "lucide-react";
import { useState } from "react";

type DepartmentDeleteDialogSettingsProps = {
    title: string;
    description: string;
    onConfirm: () => void;
    isPending: boolean;
    disabled: boolean;
};
const DepartmentDeleteDialogSettings = ({
    title,
    description,
    onConfirm,
    isPending,
    disabled,
}: DepartmentDeleteDialogSettingsProps) => {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                {/* <div className="flex flex-row text-sm gap-2 py-2 px-4 font-semibold items-center hover:bg-gray-100"> */}
                <Button className="flex w-38" variant="destructive">
                    <TrashIcon className="w-4 h-4" />
                    Delete
                </Button>
                {/* </div> */}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-red-500">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2 mt-4">
                    <Button
                        className="w-[75px]"
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-[75px]"
                        type="button"
                        variant="default"
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

export { DepartmentDeleteDialogSettings };
