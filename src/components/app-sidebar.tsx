import {
  ChevronUp,
  Home,
  Inbox,
  Database,
  Settings,
  Users,
  UserPlus,
  CreditCard,
  User2,
  Lightbulb,
  LucideShip,
  History,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { auditPath, errorsPath, homePath, ideasPath, invitePath, processBasePath, subscriptionPath, userBasePath } from "@/app/paths";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme/theme-switcher";
import { OrgBadge } from "@/features/org/components/org-badge";
import { Button } from "./ui/button";
import Link from "next/link";

const items = [
  {
    title: "Home",
    url: homePath(),
    icon: Home,
  },
  {
    title: "Errors",
    url: errorsPath(),
    icon: Inbox,
    isAdmin: true,
  },
  {
    title: "Ideas",
    url: ideasPath(),
    icon: Lightbulb,
    separator: true,
    isAdmin: true,
  },
  {
    title: "Processbase",
    url: processBasePath(),
    icon: Database,
    isAdmin: true,
  },
  {
    title: "Userbase",
    url: userBasePath(),
    icon: Users,
    isAdmin: true,
  },
  {
    title: "Audit Log",
    url: auditPath(),
    icon: History,
    isAdmin: true,
    separator: true,
  },
  {
    title: "Invite",
    url: invitePath(),
    icon: UserPlus,
    isAdmin: true,
  },
  {
    title: "Subscription",
    url: subscriptionPath(),
    icon: CreditCard,
    isAdmin: true,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    isAdmin: true,
  },
];

export async function AppSidebar() {
  const user = await getSessionUser();

  if (!user) return <div className="h-full invisible" aria-hidden></div>;
  const isAdmin = await isOrgAdminOrOwner(user.userId);

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2 h-full">

          <SidebarGroupLabel>
            <div className="flex flex-row gap-2 items-center">
              <LucideShip className="w-4 h-4" />
              <OrgBadge />
            </div>
            
          </SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => (item.isAdmin ? isAdmin : true))
                .map((item) =>
                  item.separator ? (
                    <Fragment key={item.title}>
                      <SidebarMenuItem
                        key={item.title}
                        className={cn(item.isAdmin && !isAdmin && "hidden")}
                      >
                        <SidebarMenuButton asChild>
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <Separator />
                    </Fragment>
                  ) : (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(item.isAdmin && !isAdmin && "hidden")}
                    >
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="border-2 rounded-lg">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user.email.split("@")[0]}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <ThemeSwitcher />
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Support</Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Documentation</Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Feedback</Link>
                  </Button>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <Button onClick={signOutAction} variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <p className="text-sm font-normal">Logout</p>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
