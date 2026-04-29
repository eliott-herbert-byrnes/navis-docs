import {
  errorsPath,
  ideasPath,
  procedureBasePath,
  userBasePath,
  auditPath,
  invitePath,
  subscriptionPath,
  settingsPath,
  categoriesPath,
  dashboardPath,
  departmentsPath,
} from "@/app/paths";
import {
  Home,
  Inbox,
  Lightbulb,
  Database,
  Users,
  UserPlus,
  CreditCard,
  Settings,
  History,
  Folder,
  LayoutDashboard,
} from "lucide-react";

export type NavItem = {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isAdmin?: boolean;
  hideInDemo?: boolean;
  separator?: boolean;
};

export const items = [
  // {
  //   id: "Logo",
  //   title: "",
  //   path: demoPath(),
  //   icon: Rocket,
  //   isAdmin: true,
  //   separator: true,
  // },
  {
    id: "home",
    title: "Home",
    path: dashboardPath(),
    icon: Home,
  },
  {
    id: "departments",
    title: "Departments",
    path: departmentsPath(),
    icon: LayoutDashboard,
    isAdmin: true,
  },
  {
    id: "errors",
    title: "Errors",
    path: errorsPath(),
    icon: Inbox,
    isAdmin: true,
  },
  {
    id: "ideas",
    title: "Ideas",
    path: ideasPath(),
    icon: Lightbulb,
    separator: true,
    isAdmin: true,
  },
  {
    id: "categories",
    title: "Categories",
    path: categoriesPath(),
    icon: Folder,
    isAdmin: true,
  },
  {
    id: "procedures",
    title: "Procedures",
    path: procedureBasePath(),
    icon: Database,
    isAdmin: true,
  },
  {
    id: "userbase",
    title: "Userbase",
    path: userBasePath(),
    icon: Users,
    isAdmin: true,
  },
  {
    id: "audit",
    title: "Audit Log",
    path: auditPath(),
    icon: History,
    isAdmin: true,
    hideInDemo: true,
    separator: true,
  },
  {
    id: "invite",
    title: "Invite",
    path: invitePath(),
    icon: UserPlus,
    isAdmin: true,
    hideInDemo: true,
  },
  {
    id: "subscription",
    title: "Subscription",
    path: subscriptionPath(),
    icon: CreditCard,
    isAdmin: true,
    hideInDemo: true,
  },
  {
    id: "settings",
    title: "Settings",
    path: settingsPath(),
    icon: Settings,
    isAdmin: true,
    hideInDemo: true,
    separator: true,
  },
] as const satisfies NavItem[];

export type NavItemId = (typeof items)[number]["id"];
