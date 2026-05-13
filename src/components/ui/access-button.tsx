"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/contexts/auth-context";

export function useAccessGate(adminOnly = false) {
  const { hasActiveAccess, isAdmin } = useAuthContext();
  const allowed = hasActiveAccess && (!adminOnly || isAdmin);
  const tooltip = !hasActiveAccess
    ? isAdmin
      ? "Subscribe for access"
      : "Contact your organisation admin for access"
    : adminOnly && !isAdmin
      ? "Admin access required"
      : null;
  return { allowed, tooltip };
}

export type AccessButtonProps = React.ComponentProps<typeof Button> & {
  adminOnly?: boolean;
};

export const AccessButton = React.forwardRef<
  HTMLButtonElement,
  AccessButtonProps
>(function AccessButton(
  { adminOnly = false, disabled, className, type = "button", ...props },
  ref,
) {
  const { allowed, tooltip } = useAccessGate(adminOnly);
  const locked = !allowed;

  if (!locked) {
    return (
      <Button
        ref={ref}
        type={type}
        disabled={disabled}
        className={className}
        {...props}
      />
    );
  }

  const button = (
    <Button
      ref={ref}
      {...props}
      type="button"
      className={className}
      disabled
      aria-disabled
    />
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-full">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
});

type AccessDialogTriggerProps = {
  adminOnly?: boolean;
  children: React.ReactElement;
};

export function AccessDialogTrigger({
  adminOnly = false,
  children,
}: AccessDialogTriggerProps) {
  const { allowed, tooltip } = useAccessGate(adminOnly);

  if (allowed) {
    return <DialogTrigger asChild>{children}</DialogTrigger>;
  }

  const el = React.cloneElement(
    children as React.ReactElement<
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >,
    {
      disabled: true,
      "aria-disabled": true,
      type: "button",
    },
  );

  if (!tooltip) {
    return <span className="inline-flex">{el}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{el}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

type AccessAlertDialogTriggerProps = {
  adminOnly?: boolean;
  children: React.ReactElement;
};

export function AccessAlertDialogTrigger({
  adminOnly = false,
  children,
}: AccessAlertDialogTriggerProps) {
  const { allowed, tooltip } = useAccessGate(adminOnly);

  if (allowed) {
    return <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>;
  }

  const el = React.cloneElement(
    children as React.ReactElement<
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >,
    {
      disabled: true,
      "aria-disabled": true,
      type: "button",
    },
  );

  if (!tooltip) {
    return <span className="inline-flex">{el}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{el}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
