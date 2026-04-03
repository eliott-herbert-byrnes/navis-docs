"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { ChevronDown, UserPlus, Database, Settings, Layers, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  departmentsPath,
  invitePath,
  procedureBasePath,
  settingsPath,
  subscriptionPath,
} from "@/app/paths";

type DashboardAction = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

const actions: DashboardAction[] = [
  { label: "Invite a Team Member", path: invitePath(), icon: UserPlus },
  { label: "Create a Department", path: departmentsPath(), icon: Layers },
  { label: "Create a Procedure", path: procedureBasePath(), icon: Database },
  { label: "Organisation Settings", path: settingsPath(), icon: Settings },
  { label: "Manage Subscription", path: subscriptionPath(), icon: CreditCard },
];

export function DashboardActionsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="">
          Actions <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col p-0 m-0 gap-1">
        {actions.map((action) => (
          <DropdownMenuItem key={action.label} asChild>
            <Button variant="ghost" className="flex justify-start p-4 rounded-none">
              <Link href={action.path}>
                <div className="flex flex-row gap-2 items-center">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span className=" font-medium">{action.label}</span>
                </div>
              </Link>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

