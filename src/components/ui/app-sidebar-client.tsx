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

export function AppSidebarClient({
  isAdmin,
  isDemo,
}: {
  isAdmin: boolean;
  isDemo: boolean;
}) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2 h-full">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex flex-row w-full size-8 items-center justify-center pt-2 mb-2 mt-1 gap-2">
                  <Image
                    src="/navis-docs-logo-svg.svg"
                    alt="Navis Docs Logo"
                    className="rounded-xs dark:block"
                    width={"28"}
                    height={"28"}
                  />
                  <span className="block sm:hidden">Navis Docs</span>
                </div>
              </SidebarMenuItem>
              <Separator className="light:bg-foreground" />
              {items
                .filter((item) =>
                  "isAdmin" in item && item.isAdmin ? isAdmin : true,
                )
                .filter(
                  (item) =>
                    !(isDemo && "hideInDemo" in item && item.hideInDemo),
                )
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
                        <Separator className="light:bg-foreground" />
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
        <SidebarMenu className="rounded-sm ">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton asChild className="shadow-none border-none bg-brand hover:bg-brand/80 text-black hover:text-black">
                  <div className="flex size-2 shrink-0 items-center justify-center">
                    <User2 />
                  </div>
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
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-2 w-full rounded-none"
                  >
                    <Link href="mailto:hello@navisdocs.com" className="text-sm font-normal cursor-default ml-2">
                      Support
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-2 w-full rounded-none"
                  >
                    <Link href="/docs" target="_blank" className="text-sm font-normal cursor-default ml-2">
                      Documentation
                    </Link>
                  </Button>
                </DropdownMenuItem>
                {isDemo ? (
                  null
                ) : (
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="flex flex-row justify-start p-2 w-full rounded-none"
                      type="submit"
                      onClick={signOutAction}
                    >
                      <p className="text-sm font-normal ml-2">Logout</p>
                    </Button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

