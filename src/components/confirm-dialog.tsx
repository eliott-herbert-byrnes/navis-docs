import {
    cloneElement,
    useActionState,
    useEffect,
    useRef,
    useState,
  } from "react";
  import { toast } from "sonner";
  import { ActionState, EMPTY_ACTION_STATE } from "./form/utils/to-action-state";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button } from "./ui/button";
  import { useActionFeedback } from "./form/hooks/use-action-feedback";
  
  type UseConfirmDialogArgs = {
    title?: string;
    description?: string;
    action: () => Promise<ActionState>;
    trigger?: React.ReactElement | ((isLoading: boolean) => React.ReactElement);
    onSuccess?: (actionState: ActionState) => void;
  };
  
  const useConfirmDialog = ({
    title,
    description,
    action,
    trigger,
    onSuccess,
  }: UseConfirmDialogArgs) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const actionAdapter = async () => {
      return action();
    };
  
    const [actionState, formAction, isPending] = useActionState(
      actionAdapter,
      EMPTY_ACTION_STATE
    );
  
    const resolvedTrigger =
      typeof trigger === "function" ? trigger(isPending) : trigger;
  
    const dialogTrigger = cloneElement(
      resolvedTrigger as React.ReactElement<{ onClick?: () => void }>,
      {
        onClick: () => setIsOpen((state) => !state),
      }
    );
  
    const toastRef = useRef<string | number | null>(null);
  
    useEffect(() => {
      if (isPending) {
        toastRef.current = toast.loading("Processing ...");
      } else if (toastRef.current) {
        toast.dismiss(toastRef.current);
      } 
  
      return () => {
        if (toastRef.current) {
          toast.dismiss(toastRef.current);
        }
      };
    }, [isPending]);
  
    useActionFeedback(actionState, {
      onSuccess: ({ actionState }) => {
        if (actionState.message) {
          toast.success(actionState.message);
        }
  
        onSuccess?.(actionState);
      },
      onError: ({ actionState }) => {
        if (actionState.message) {
          toast.error(actionState.message);
        }
      },
    });
  
    const dialog = (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <form action={formAction}>
                <Button type="submit">Confirm</Button>
              </form>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  
    return [dialogTrigger, dialog] as const;
  };
  
  export { useConfirmDialog };