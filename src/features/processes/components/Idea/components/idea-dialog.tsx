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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProcessRouteContext } from "@/contexts/process-route-context";
import { Lightbulb, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";

type ProcessIdeaDialogProps = {
  title: string;
  description: string;
  onSubmit: (data: {
    teamId: string;
    ideaTitle: string;
    ideaBody: string;
  }) => void;
  isPending: boolean;
};

const ProcessIdeaDialog = ({
  title,
  description,
  onSubmit,
  isPending,
}: ProcessIdeaDialogProps) => {
  const [open, setOpen] = useState(false);
  const { teamId } = useProcessRouteContext();

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
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Lightbulb className="h-4 w-4" />
          Submit Idea
        </Button>
      </DialogTrigger>
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
            />
            <Textarea
              name="ideaBody"
              placeholder="Describe the idea..."
              required
              rows={10}
              disabled={isPending}
              maxLength={1000}
            />
          </div>
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
            <Button className="w-[75px]" type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ProcessIdeaDialog };
