// Main Application Paths
export const homePath = () => "/";
export const invitePath = () => "/invite";
export const signInPath = () => "/auth/sign-in";
export const onboardingPath = () => "/onboarding";
export const subscriptionPath = () => "/subscription";
export const acceptInvitePath = (token?: string) =>
  `/auth/accept-invite${token ? `?token=${token}` : ""}`;
export const auditPath = () => "/audit";
export const errorsPath = () => "/errors";
export const ideasPath = () => "/ideas";
export const newsPath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/procedures/news`;
export const newsCreatePath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/procedures/news-create`;
export const procedureBasePath = () => "/procedure-base";
export const categoriesPath = () => "/categories";
export const userBasePath = () => "/user-base";
export const settingsPath = () => "/settings";
export const addressPath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/procedures/address`;
export const demoPath = () => "/demo";
export const dashboardPath = () => "/dashboard";

// Procedure Database Paths
export const departmentPath = (departmentId: string) =>
  `/departments/${departmentId}`;
export const teamProcedureCreatePath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/procedures/create`;
export const teamProcedurePath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/procedures`;
export const procedurePath = (
  departmentId: string,
  teamId: string,
  procedureId: string,
) => `/departments/${departmentId}/${teamId}/procedures/${procedureId}`;
export const editProcedurePath = (
  departmentId: string,
  teamId: string,
  procedureId: string,
) => `/departments/${departmentId}/${teamId}/procedures/${procedureId}/edit`;
export const viewProcedurePath = (
  departmentId: string,
  teamId: string,
  procedureId: string,
) => `/departments/${departmentId}/${teamId}/procedures/${procedureId}/view`;
export const favoriteProceduresPath = () =>
  `/department/[departmentId]/[teamId]/procedures`;
export const procedureBaseImportPath = () => "/procedure-base/import";
