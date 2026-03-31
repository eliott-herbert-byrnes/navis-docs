"use client";

import { User2 } from "lucide-react";
import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { items } from "@/config/navigation";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "../theme/theme-switcher";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Separator } from "./separator";

function isPathActive(pathname: string, itemPath: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}

export function AppSidebarClient({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2 h-full">
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex flex-row gap-2 items-center pt-2 mb-2 mt-1">
                <Image
                  src="/navis-docs-logo-black-png.png"
                  alt="Navis Docs Logo"
                  className="rounded-xs mx-auto dark:hidden"
                  width="25"
                  height="25"
                />
                <Image
                  src="/navis-docs-logo-blue-png.png"
                  alt="Navis Docs Logo"
                  className="rounded-xs mx-auto hidden dark:block"
                  width="25"
                  height="25"
                />
                <span className="text-sm group-data-[collapsible=icon]:hidden">
                  Navis Docs
                </span>
              </div>
              <Separator className="bg-background" />
              {items
                .filter((item) => ("isAdmin" in item && item.isAdmin ? isAdmin : true))
                .map((item) => {
                  const active = isPathActive(pathname, item.path);
                  const menuItem = (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(
                        "isAdmin" in item && item.isAdmin && !isAdmin && "hidden",
                      )}
                    >
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                      >
                        <Link href={item.path}>
                          <item.icon strokeWidth={1.75} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  if ("separator" in item && item.separator) {
                    return (
                      <Fragment key={item.title}>
                        {menuItem}
                        <Separator className="bg-background" />
                      </Fragment>
                    );
                  }

                  return menuItem;
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="border-1 rounded-sm shadow">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="light:bg-white">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <User2 />
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                className="translate-x-4"
              >
                <DropdownMenuItem asChild>
                  <ThemeSwitcher />
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link href="/" className="text-sm font-normal cursor-default ml-2">
                      Support
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link href="/" className="text-sm font-normal cursor-default ml-2">
                      Documentation
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link href="/" className="text-sm font-normal cursor-default ml-2">
                      Feedback
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                    type="submit"
                    onClick={signOutAction}
                  >
                    <p className="text-sm font-normal ml-2">Logout</p>
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

