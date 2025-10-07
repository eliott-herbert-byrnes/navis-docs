import { PrismaClient, OrgMembershipRole, ProcessStyle, ProcessStatus } from '@prisma/client'
const prisma = new PrismaClient();

async function main() {

await prisma.$transaction([
  prisma.ingestionJob.deleteMany(),
  prisma.errorReport.deleteMany(),
  prisma.newsPost.deleteMany(),
  prisma.favorite.deleteMany(),
  prisma.idea.deleteMany(),
  prisma.processVersion.deleteMany(),
  prisma.process.deleteMany(),
  prisma.category.deleteMany(),
  prisma.team.deleteMany(),
  prisma.department.deleteMany(),
  prisma.orgMembership.deleteMany(),
  prisma.invitation.deleteMany(),
  prisma.account.deleteMany(),
  prisma.verificationToken.deleteMany(),
  prisma.emailOTP.deleteMany(),
  prisma.auditLog.deleteMany(),

  prisma.organization.deleteMany(),
  prisma.user.deleteMany(),
]);

  const user = await prisma.user.upsert({
    where: { email: 'demo@navisdocs.com' },
    update: {},
    create: { email: 'demo@navisdocs.com', name: 'Demo User' },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-orginization' },
    update: {},
    create: {
      name: 'Demo Orginization',
      slug: 'demo-orginization',
      ownerUserId: user.id,
      plan: 'business',
      entitlementsJSON: {
        maxProcesses: 100,
        maxDepartments: 3,
        maxTeamsPerDepartment: 1,
      },
    },
  });

  await prisma.orgMembership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: { role: OrgMembershipRole.OWNER },
    create: { orgId: org.id, userId: user.id, role: OrgMembershipRole.OWNER  },
  });

  const dept1 = await prisma.department.upsert({
    where: { id: org.id.slice(0, 24) + '-dept-a' },
    update: {},
    create: { id: org.id.slice(0, 24) + '-dept-a', orgId: org.id, name: 'Operations' },
  });
  const dept2 = await prisma.department.upsert({
    where: { id: org.id.slice(0, 24) + '-dept-b' },
    update: {},
    create: { id: org.id.slice(0, 24) + '-dept-b', orgId: org.id, name: 'Fraud' },
  });

  const teamOps = await prisma.team.create({
    data: { departmentId: dept1.id, name: 'Collections' },
  });
  const teamComp = await prisma.team.create({
    data: { departmentId: dept2.id, name: 'Applications' },
  });

  const catOps = await prisma.category.create({
    data: { teamId: teamOps.id, name: 'Payments', sortOrder: 1 },
  });
  const catComp = await prisma.category.create({
    data: { teamId: teamComp.id, name: 'Identity Verification', sortOrder: 1 },
  });

  const p1 = await prisma.process.create({
    data: {
      teamId: teamOps.id,
      categoryId: catOps.id,
      slug: 'setup-a-direct-debit',
      title: 'Setup a Direct Debit',
      description: 'Follow the below information to setup a direct debit.',
      style: ProcessStyle.STEPS,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p2 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catComp.id,
      slug: 'kyc-basic-check',
      title: 'KYC Basic Check',
      description: 'Basic verification steps for new customers.',
      style: ProcessStyle.RAW,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const pv1 = await prisma.processVersion.create({
    data: {
      processId: p1.id,
      createdBy: user.id,
      style: ProcessStyle.STEPS,
      contentJSON: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Steps' }] },
          { type: 'orderedList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Check for existing direct debits.' }]}]},
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'If found, follow the direct debit ammendment process.' }]}]},
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'If not found, follow the direct debit setup process by clicking the direct debit calculator link.' }]}]},
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Once you have completed the direct debit calculator, you can then proceed to setup the direct debit on TCS.' }]}]},
          ] }
        ]
      },
      contentText: 'Open ticket… Review context… Reply using template…',
    },
  })

  const pv2 = await prisma.processVersion.create({
    data: {
      processId: p2.id,
      createdBy: user.id,
      style: ProcessStyle.RAW,
      contentJSON: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Collect basic identity documents and verify against provider.' }] },
        ],
      },
      contentText: 'Collect basic identity documents…',
    },
  })

  await prisma.process.update({
    where: { id: p1.id },
    data: { pendingVersionId: pv1.id },
  });

  await prisma.process.update({
    where: { id: p2.id },
    data: { pendingVersionId: pv2.id },
  });

  await prisma.newsPost.create({
    data: {
      teamId: teamOps.id,
      title: 'Welcome to the new Docs',
      bodyJSON: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'We’ve launched our new documentation portal.' }] }] },
      pinned: true,
      createdBy: user.id,
    },
  });

  console.log('✅ Seed complete');
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});