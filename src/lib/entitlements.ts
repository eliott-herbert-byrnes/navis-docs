export type Entitlements = {
    maxProcesses: number | null;
    maxDepartments: number | null;
    maxTeamsPerDepartment: number | null;
}

export const BUSINESS: Entitlements = { maxProcesses: 100, maxDepartments: 3, maxTeamsPerDepartment: 1 };
export const ENTERPRISE: Entitlements = { maxProcesses: 1000, maxDepartments: null, maxTeamsPerDepartment: null };

export function entitlementForPlan(plan: 'business' | 'enterprise'): Entitlements {
    return plan === 'enterprise' ? ENTERPRISE : BUSINESS;
}