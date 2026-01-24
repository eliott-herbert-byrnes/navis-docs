"use client";

import { createContext, useContext, ReactNode } from "react";

type ProcessRouteContextValue = {
  departmentId: string;
  teamId: string;
};

const ProcessRouteContext = createContext<ProcessRouteContextValue | null>(
  null,
);

export function ProcessRouteProvider({
  children,
  departmentId,
  teamId,
}: {
  children: ReactNode;
  departmentId: string;
  teamId: string;
}) {
  return (
    <ProcessRouteContext.Provider value={{ departmentId, teamId }}>
      {children}
    </ProcessRouteContext.Provider>
  );
}

export function useProcessRouteContext() {
  const context = useContext(ProcessRouteContext);
  if (!context) {
    throw new Error(
      "useProcessRouteContext must be used within ProcessRouteProvider",
    );
  }
  return context;
}
