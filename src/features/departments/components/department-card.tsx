import { onboardingPath, signInPath } from "@/app/paths";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const DepartmentCard = async () => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

//   const deptCount = await prisma.department.count({ where: { orgId: org.id } });
  const teams = await prisma.team.findMany({
    where: { department: { orgId: org.id } },
    include: { department: true },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>
        <div>
          {teams.map((team) => (
            <div key={team.id}>
              {team.department?.name ?? "No Department"}
            </div>
          ))}
        </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
export { DepartmentCard };
