"use client";

import { items } from "@/config/navigation";
import { usePathname } from "next/navigation";

export type PathParseResult =
  | { type: "home" }
  | { type: "org-route"; segment: string }
  | { type: "department"; departmentId: string; teamId: string }
  | { type: "org-route"; segment?: undefined };

function parsePath(pathname: string): PathParseResult {
  const trimmed = pathname.trim();

  if (trimmed === "/") return { type: "home" };

  const segments = trimmed.split("/");

  if (segments[1] === "departments" && segments[2] && segments[3]) {
    return {
      type: "department",
      departmentId: segments[2],
      teamId: segments[3],
    };
  }

  const matched = items.find((item) => trimmed === item.path);
  if (matched) return { type: "org-route", segment: matched.id };

  return { type: "org-route" };
}

export function usePathParse(): PathParseResult {
  const pathname = usePathname();
  return parsePath(pathname ?? "");
}
