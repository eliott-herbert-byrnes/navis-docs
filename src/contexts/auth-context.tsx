"use client";

import { createContext, useContext, ReactNode } from "react";
import type { OrgAccessLevel } from "@/lib/billing/access";

type AuthContextValue = {
  isAdmin: boolean;
  /** Write access — see `resolveOrgWriteAccess()`. */
  hasActiveAccess: boolean;
  accessLevel: OrgAccessLevel;
  graceEndsAt: Date | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  isAdmin,
  hasActiveAccess,
  accessLevel,
  graceEndsAt,
}: {
  children: ReactNode;
  isAdmin: boolean;
  hasActiveAccess: boolean;
  accessLevel: OrgAccessLevel;
  graceEndsAt: Date | null;
}) {
  return (
    <AuthContext.Provider
      value={{ isAdmin, hasActiveAccess, accessLevel, graceEndsAt }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
