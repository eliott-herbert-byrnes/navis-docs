import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export const useConfirm = () => {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    body: string;
    resolve?: (v: boolean) => void;
  }>({ open: false, title: "", body: "" });

  const confirm = (title: string, body: string) =>
    new Promise<boolean>((resolve) => {
      setState({ open: true, title, body, resolve });
    });

  const ui = (
    <Dialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) state.resolve?.(false);
        setState((s) => ({ ...s, open }));
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{state.body}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              state.resolve?.(false);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              state.resolve?.(true);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  return { confirm, ui };
};
