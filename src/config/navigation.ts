import { demoPath, homePath, errorsPath, ideasPath, procedureBasePath, userBasePath, auditPath, invitePath, subscriptionPath, settingsPath } from "@/app/paths";
import { Rocket, Home, Inbox, Lightbulb, Database, Users, UserPlus, CreditCard, Settings, History } from "lucide-react";

export type NavItem = {
    id: string;
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    isAdmin?: boolean;
    separator?: boolean;
}

export const items = [
    {
        id: "demo",
        title: "Demo Info",
        path: demoPath(),
        icon: Rocket,
        isAdmin: true,
        separator: true,
    },
    {
        id: "home",
        title: "Home",
        path: homePath(),
        icon: Home,
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
        separator: true,
    },
    {
        id: "invite",
        title: "Invite",
        path: invitePath(),
        icon: UserPlus,
        isAdmin: true,
    },
    {
        id: "subscription",
        title: "Subscription",
        path: subscriptionPath(),
        icon: CreditCard,
        isAdmin: true,
    },
    {
        id: "settings",
        title: "Settings",
        path: settingsPath(),
        icon: Settings,
        isAdmin: true,
        separator: true,
    },
] as const satisfies NavItem[];

export type NavItemId = (typeof items)[number]["id"];
