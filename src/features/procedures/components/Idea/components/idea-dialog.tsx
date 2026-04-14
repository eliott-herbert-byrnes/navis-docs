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
import { AccessDialogTrigger } from "@/components/ui/access-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { Lightbulb } from "lucide-react";
import { useState, FormEvent } from "react";

type ProcedureIdeaDialogProps = {
  title: string;
  description: string;
  onSubmit: (data: {
    teamId: string;
    ideaTitle: string;
    ideaBody: string;
  }) => void;
  isPending: boolean;
};

const ProcedureIdeaDialog = ({
  title,
  description,
  onSubmit,
  isPending,
}: ProcedureIdeaDialogProps) => {
  const [open, setOpen] = useState(false);
  const { teamId } = useProcedureRouteContext();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onSubmit({
      teamId,
      ideaTitle: String(formData.get("ideaTitle") ?? "").trim(),
      ideaBody: String(formData.get("ideaBody") ?? "").trim(),
    });

    setOpen(false);

    e.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Lightbulb className="h-4 w-4" />
          Submit Idea
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Input
              name="ideaTitle"
              placeholder="Title of the idea..."
              required
              disabled={isPending}
              maxLength={100}
              className="shadow-none border"
            />
            <Textarea
              name="ideaBody"
              placeholder="Describe the idea..."
              required
              rows={10}
              disabled={isPending}
              maxLength={1000}
              className="shadow-none border"
            />
          </div>
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button className="w-[75px] shadow-none border" type="submit" isLoading={isPending}>
              Submit
            </Button>
            <Button
              className="w-[75px] shadow-none border"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ProcedureIdeaDialog };
