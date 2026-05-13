import { LucideChevronDown } from "lucide-react";
import Link from "next/link";
import { Fragment, ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type BreadcrumbsProps = {
  breadcrumbs: {
    id?: string;
    title: ReactNode;
    href?: string;
    dropdownAriaLabel?: string;
    dropdown?: {
      id?: string;
      title: string;
      href: string;
    }[];
    dropdownGroups?: {
      label: string;
      items: { id?: string; title: string; href: string }[];
    }[];
  }[];
};

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          let breadcrumbItem = (
            <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
          );

          if (breadcrumb.href) {
            breadcrumbItem = (
              <BreadcrumbLink asChild>
                <Link
                  href={breadcrumb.href}
                  className="flex items-center gap-1 text-secondary-foreground hover:text-secondary-foreground/80"
                >
                  {breadcrumb.title}
                </Link>
              </BreadcrumbLink>
            );
          }

          if (breadcrumb.dropdownGroups) {
            breadcrumbItem = (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors cursor-pointer"
                  aria-label={breadcrumb.dropdownAriaLabel}
                >
                  {breadcrumb.title}
                  <LucideChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {breadcrumb.dropdownGroups.map((group) => (
                    <DropdownMenuGroup key={group.label}>
                      <DropdownMenuLabel className="m-0 ml-2 py-2 px-0">
                        {group.label}
                      </DropdownMenuLabel>
                      {group.items.map((item) => (
                        <DropdownMenuItem
                          asChild
                          key={item.id ?? item.href}
                          className="py-2"
                        >
                          <Link href={item.href}>{item.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          if (breadcrumb.dropdown) {
            breadcrumbItem = (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors cursor-pointer"
                  aria-label={breadcrumb.dropdownAriaLabel}
                >
                  {breadcrumb.title}
                  <LucideChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {breadcrumb.dropdown.map((item) => (
                    <DropdownMenuItem
                      asChild
                      key={item.id ?? item.href}
                      className="py-2"
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Fragment
              key={breadcrumb.id ?? breadcrumb.href ?? `breadcrumb-${index}`}
            >
              <BreadcrumbItem>{breadcrumbItem}</BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <p className="text-xs pb-1 mr-0.5">|</p>
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export { Breadcrumbs };
