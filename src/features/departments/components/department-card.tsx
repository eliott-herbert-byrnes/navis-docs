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
import {
  EyeIcon,
  LucideLoaderCircle,
  SquareArrowUpRight,
  FileText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamDropdown } from "./team-dropdown";
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

  const totalProcedures = department.teams.reduce(
    (sum, team) => sum + team._count.procedure,
    0,
  );

  const handleViewClick = () => {
    if (!selectedTeamId) return;
    startTransition(() => {
      router.push(teamProcedurePath(department.id, selectedTeamId));
    });
  };

  const buttons = (
    <>
      <div className="flex flex-row gap-x-2 gap-y-2 w-full">
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            className="w-full"
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
    </>
  );

  return (
    <Card className="w-full max-w-[250px] animate-fade-from-top hover:scale-101 transition-all duration-300">
      <CardHeader>
        <CardTitle>
          <Badge className="text-sm">{department.name}</Badge>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <FileText className="h-3 w-3" />
            <span>
              {totalProcedures}{" "}
              {totalProcedures === 1 ? "procedure" : "procedures"}
            </span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Users className="h-3 w-3" />
            <span>
              {department.teams.length}{" "}
              {department.teams.length === 1 ? "team" : "teams"}
            </span>
          </Badge>
        </div>
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
