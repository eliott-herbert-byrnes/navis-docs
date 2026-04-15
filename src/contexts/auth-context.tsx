"use client";

import { createContext, useContext, ReactNode } from "react";

type AuthContextValue = {
  isAdmin: boolean;
  hasActiveAccess: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  isAdmin,
  hasActiveAccess,
}: {
  children: ReactNode;
  isAdmin: boolean;
  hasActiveAccess: boolean;
}) {
  return (
    <AuthContext.Provider value={{ isAdmin, hasActiveAccess }}>
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
