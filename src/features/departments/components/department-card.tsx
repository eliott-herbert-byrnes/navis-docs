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
import { Badge } from "@/components/ui/badge";
import { TeamDropdown } from "./team-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DepartmentDeleteButton } from "./department-buttons/department-delete-button";
import { DepartmentTeamButton } from "./department-buttons/department-team-button";
import { DepartmentOverviewButton } from "./overview/department-overview-button";
import { teamProcessPath } from "@/app/paths";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DepartmentCardProps = {
  department: {
    id: string;
    name: string;
    teams: { id: string; name: string }[];
  };
  isAdmin: boolean;
};

const DepartmentCard = ({ department, isAdmin }: DepartmentCardProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleViewClick = () => {
    if (!selectedTeamId) return;

    startTransition(() => {
      router.push(teamProcessPath(department.id, selectedTeamId));
    });
  };
  const buttons = (
    <>
      <div className="flex flex-row gap-x-2 gap-y-2 w-full">
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            className="w-full w-[96px]"
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
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="w-full max-w-[96px]">
              <SquareArrowUpRight className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-1.5">
            <DropdownMenuItem asChild>
              <DepartmentOverviewButton
                isAdmin={isAdmin}
                title={department.name}
                departmentId={department.id}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DepartmentTeamButton departmentId={department.id} isAdmin={isAdmin} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DepartmentDeleteButton departmentId={department.id} isAdmin={isAdmin} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <Card className="w-full max-w-[250px]">
      <CardHeader>
        <CardTitle>
          <Badge className="text-sm">{department.name}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Select a team to view processes
        </p>
      </CardHeader>
      <CardContent>
        <TeamDropdown
          department={department}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
        />
      </CardContent>
      <CardFooter>
        <CardAction>{buttons}</CardAction>
      </CardFooter>
    </Card>
  );
};

export { DepartmentCard };
