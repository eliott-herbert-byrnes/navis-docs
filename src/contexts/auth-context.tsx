"use client";

import { createContext, useContext, ReactNode } from "react";

type AuthContextValue = {
  isAdmin: boolean;
  userId: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  isAdmin,
  userId,
}: {
  children: ReactNode;
  isAdmin: boolean;
  userId: string | null;
}) {
  return (
    <AuthContext.Provider value={{ isAdmin, userId }}>
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
