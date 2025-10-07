import { Prisma } from "@prisma/client";

export type DepartmentWithMetadata = Prisma.DepartmentGetPayload<{
include: {
    teams: true
}
}> & {
    permissions: {canDeleteDepartment: boolean, canUpdateDepartment: boolean};
    teams: {
        id: string;
        name: string;
    }[];
}

export type TeamWithMetadata = Prisma.TeamGetPayload<{
    include: {
        department: true
    }
}> & {
    permissions: {canDeleteTeam: boolean, canUpdateTeam: boolean};
    department: {
        id: string;
        name: string;
    };
}