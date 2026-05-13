"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, LucideLoaderCircle, SquareArrowUpRight } from "lucide-react";
import { TeamDropdown } from "./team-dropdown";
import { DepartmentIconSelector } from "./department-icon-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DepartmentDeleteButton } from "./department-buttons/department-delete-button";
import { CreateTeamButton } from "./team-buttons/team-create-button";
import { DepartmentOverviewButton } from "./overview/department-overview-button";
import { teamProcedurePath } from "@/app/paths";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DepartmentCardProps = {
  department: {
    id: string;
    name: string;
    iconKey?: string | null;
    teams: {
      id: string;
      name: string;
      _count: { procedure: number };
    }[];
  };
};

const DepartmentCard = ({ department }: DepartmentCardProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleViewClick = () => {
    if (!selectedTeamId) return;
    startTransition(() => {
      router.push(teamProcedurePath(department.id, selectedTeamId));
    });
  };

  const buttons = (
    <div className="grid w-full grid-cols-2 gap-2">
      <Button
        className="w-full shadow-none"
        variant="outline"
        onClick={handleViewClick}
        disabled={!selectedTeamId || isPending}
      >
        {isPending ? (
          <LucideLoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <EyeIcon className="w-4 h-4" />
        )}
        View
      </Button>
      <div className="min-w-0 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full shadow-none" variant="outline">
              <SquareArrowUpRight className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="flex flex-col">
            <DropdownMenuItem asChild>
              <DepartmentOverviewButton
                title={department.name}
                departmentId={department.id}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <CreateTeamButton departmentId={department.id} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DepartmentDeleteButton
                departmentId={department.id}
                departmentName={department.name}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-[250px] animate-fade-from-top transition-all duration-300 border-1 shadow-none gap-4">
      <CardHeader>
        <DepartmentIconSelector
          departmentId={department.id}
          departmentName={department.name}
          iconKey={department.iconKey}
        />
        <CardTitle>
          <span className="text-xl font-medium">{department.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TeamDropdown
          department={department}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
        />
      </CardContent>
      <CardFooter className="w-full mt-1">
        <CardAction className="w-full">{buttons}</CardAction>
      </CardFooter>
    </Card>
  );
};

export { DepartmentCard };
