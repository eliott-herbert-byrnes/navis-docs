"use client";

import { ActionState } from "./utils/to-action-state";

type fieldErrorProps = {
  actionState: ActionState;
  name: string;
};

const FieldError = ({ actionState, name }: fieldErrorProps) => {
  const message = actionState.fieldErrors[name]?.[0];

  if (!message) return null;

  return <span className="text-xs text-red-500">{message}</span>;
};

export { FieldError };