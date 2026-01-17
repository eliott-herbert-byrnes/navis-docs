"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/trpc/client";

type TeamDropdownProps = {
  department: {
    id: string;
    name: string;
    teams: { id: string; name: string }[];
  };
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string) => void;
};

const TeamDropdown = ({
  department,
  selectedTeamId,
  onTeamSelect,
}: TeamDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const { data } = trpc.team.list.useQuery({ departmentId: department.id });

  const teams = data?.teams ?? [];
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedTeam ? selectedTeam.name : "Select team..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." className="h-9" />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => {
                    onTeamSelect(team.id);
                    setOpen(false);
                  }}
                >
                  {team.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedTeamId === team.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { TeamDropdown };
