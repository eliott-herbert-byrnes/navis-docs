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
  `/departments/${departmentId}/${teamId}/processes/news`;
export const newsCreatePath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/processes/news-create`;

// Process Database Paths
export const departmentPath = (departmentId: string) =>
  `/departments/${departmentId}`;
export const teamProcessCreatePath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/processes/create`;
export const teamProcessPath = (departmentId: string, teamId: string) =>
  `/departments/${departmentId}/${teamId}/processes`;
export const processPath = (
  departmentId: string,
  teamId: string,
  processId: string
) => `/departments/${departmentId}/${teamId}/processes/${processId}`;
export const editProcessPath = (
  departmentId: string,
  teamId: string,
  processId: string
) => `/departments/${departmentId}/${teamId}/processes/${processId}/edit`;
export const viewProcessPath = (
  departmentId: string,
  teamId: string,
  processId: string
) => `/departments/${departmentId}/${teamId}/processes/${processId}/view`;
export const favoriteProcessesPath = () =>
  `/department/[departmentId]/[teamId]/processes`;
