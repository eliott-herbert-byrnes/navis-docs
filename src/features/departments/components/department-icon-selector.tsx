"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  departmentIconKeys,
  getDepartmentIcon,
  getDepartmentIconLabel,
  type DepartmentIconKey,
} from "./department-icon-registry";
import { useSetDepartmentIcon } from "../hooks/use-department-mutations";

type DepartmentIconSelectorProps = {
  departmentId: string;
  departmentName: string;
  iconKey?: string | null;
};

function normalizeIconKey(iconKey?: string | null): DepartmentIconKey {
  if (iconKey && departmentIconKeys.includes(iconKey as DepartmentIconKey)) {
    return iconKey as DepartmentIconKey;
  }
  return "users";
}

export function DepartmentIconSelector({
  departmentId,
  departmentName,
  iconKey,
}: DepartmentIconSelectorProps) {
  const { isAdmin, hasActiveAccess } = useAuthContext();
  const selectedIconKey = normalizeIconKey(iconKey);

  const [open, setOpen] = React.useState(false);
  const { setDepartmentIcon, isPending } = useSetDepartmentIcon();

  const handlePick = (nextIconKey: DepartmentIconKey) => {
    if (!isAdmin || !hasActiveAccess) return;

    // No-op: do not write when selecting the already-selected icon.
    if (nextIconKey === selectedIconKey) {
      setOpen(false);
      return;
    }

    setOpen(false);
    setDepartmentIcon({ departmentId, iconKey: nextIconKey });
  };

  const CurrentIcon = getDepartmentIcon(selectedIconKey);
  const triggerAriaLabel = `Select icon for ${departmentName}`;

  // Non-admin users see a static icon.
  if (!isAdmin) {
    return (
      <CurrentIcon
        width="45"
        height="45"
        className="bg-secondary p-2 rounded-md border-1 mb-1"
        aria-label={`${departmentName} department icon: ${getDepartmentIconLabel(selectedIconKey)}`}
      />
    );
  }

  if (!hasActiveAccess) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex rounded-md">
            <CurrentIcon
              width="45"
              height="45"
              className="bg-secondary p-2 rounded-md border-1 mb-1 opacity-60"
              aria-label={`${departmentName} department icon: ${getDepartmentIconLabel(selectedIconKey)}`}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>Subscribe for access</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          disabled={isPending}
          className={cn(
            "p-0 bg-transparent border-0 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <CurrentIcon
            width="45"
            height="45"
            className="bg-secondary p-2 rounded-md border-1 mb-1"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-full p-2"
        aria-label={`Choose an icon for ${departmentName}`}
      >
        <ScrollArea className="w-full">
          {/* <div className="grid grid-cols-4 gap-2"> */}
          <div className="flex flex-row gap-1.5 p-0.5">
            {departmentIconKeys.map((key) => {
              const OptionIcon = getDepartmentIcon(key);
              const isSelected = key === selectedIconKey;
              const label = getDepartmentIconLabel(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePick(key)}
                  disabled={isPending}
                  aria-label={`Set icon: ${label}`}
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    "transition-colors hover:bg-secondary/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  <OptionIcon
                    width="32"
                    height="32"
                    className={cn(
                      "bg-secondary p-1 rounded-sm border-1",
                      isSelected && "ring-2 ring-ring",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
