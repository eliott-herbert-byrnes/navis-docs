import {
  Database,
  Inbox,
  Lightbulb,
  Layers,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

export const departmentIconRegistry = {
  users: Users,
  layers: Layers,
  database: Database,
  settings: Settings,
  inbox: Inbox,
  lightbulb: Lightbulb,
  userPlus: UserPlus,
} as const;

export type DepartmentIconKey = keyof typeof departmentIconRegistry;
export type DepartmentIconComponent =
  (typeof departmentIconRegistry)[DepartmentIconKey];

export const departmentIconKeys = Object.keys(
  departmentIconRegistry,
) as DepartmentIconKey[];

const departmentIconLabels: Record<DepartmentIconKey, string> = {
  users: "Users",
  layers: "Layers",
  database: "Database",
  settings: "Settings",
  inbox: "Inbox",
  lightbulb: "Lightbulb",
  userPlus: "Invite user",
};

export function getDepartmentIcon(
  iconKey?: DepartmentIconKey | string | null,
): DepartmentIconComponent {
  if (!iconKey) return Users as DepartmentIconComponent;
  return (
    departmentIconRegistry[iconKey as DepartmentIconKey] ??
    (Users as DepartmentIconComponent)
  );
}

export function getDepartmentIconLabel(
  iconKey?: DepartmentIconKey | string | null,
): string {
  if (!iconKey) return departmentIconLabels.users;
  return departmentIconLabels[iconKey as DepartmentIconKey] ?? departmentIconLabels.users;
}

