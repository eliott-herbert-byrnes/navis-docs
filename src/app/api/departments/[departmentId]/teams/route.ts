// navis-docs/src/app/api/departments/[departmentId]/teams/route.ts
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const {org} = await getUserOrgWithRole(user.userId);
    if (!org) return new Response("No organization found", { status: 404 });

    const { departmentId } = await params;

    const department = await prisma.department.findFirst({
      where: { id: departmentId, orgId: org.id },
      select: { id: true },
    });
    if (!department) return new Response("Department not found", { status: 404 });

    const teams = await prisma.team.findMany({
      where: { departmentId },
      select: { id: true, name: true, departmentId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify({ teams }), { status: 200, headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}