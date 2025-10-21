// Main Application Paths
export const homePath = () => "/";
export const invitePath = () => "/invite";
export const signInPath = () => "/auth/sign-in";
export const onboardingPath = () => "/onboarding";
export const subscriptionPath = () => "/subscription";
export const acceptInvitePath = (token?: string) => 
    `/auth/accept-invite${token ? `?token=${token}` : ""}`;