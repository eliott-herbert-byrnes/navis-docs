"use client";

import { createContext, useContext, ReactNode } from "react";

type ProcedureRouteContextValue = {
  departmentId: string;
  teamId: string;
};

const ProcedureRouteContext = createContext<ProcedureRouteContextValue | null>(
  null,
);

export function ProcedureRouteProvider({
  children,
  departmentId,
  teamId,
}: {
  children: ReactNode;
  departmentId: string;
  teamId: string;
}) {
  return (
    <ProcedureRouteContext.Provider value={{ departmentId, teamId }}>
      {children}
    </ProcedureRouteContext.Provider>
  );
}

export function useProcedureRouteContext() {
  const context = useContext(ProcedureRouteContext);
  if (!context) {
    throw new Error(
      "useProcedureRouteContext must be used within ProcedureRouteProvider",
    );
  }
  return context;
}
