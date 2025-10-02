"use client";

import { useCallback, useState, useTransition } from "react";
import { ActionState } from "@/components/form/utils/to-action-state";

function isNextRedirectError(e: unknown): e is { digest: string } {
  if (typeof e !== "object" || e === null) return false;
  const digest = (e as Record<string, unknown>).digest;
  return typeof digest === "string" && digest === "NEXT_REDIRECT";
}

export function useActionState<T extends ActionState>(
  action: (state: T, formData: FormData) => Promise<T | undefined>,
  initialState: T
): [T, (formData: FormData) => void, boolean] {
  const [actionState, setActionState] = useState<T>(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          const nextState = await action(actionState, formData);
          if(nextState) setActionState(nextState);
        } catch (err: unknown) {
            if(isNextRedirectError(err)) return;
            throw err;
        }
      });
    },
    [action, actionState]
  );

  return [actionState, formAction, isPending];
}