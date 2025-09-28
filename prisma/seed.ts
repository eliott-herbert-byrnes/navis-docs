import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

async function main() {

  const user = await prisma.user.upsert({
    where: { email: 'demo@navisdocs.com' },
    update: {},
    create: { email: 'demo@navisdocs.com', name: 'Demo User' },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-orginization' },
    update: {},
    create: {
      name: 'Demo OrgInization',
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
    update: { role: 'owner' },
    create: { orgId: org.id, userId: user.id, role: 'owner' },
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
      style: 'steps',
      status: 'published',
    },
  });

  const p2 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catComp.id,
      slug: 'kyc-basic-check',
      title: 'KYC Basic Check',
      description: 'Basic verification steps for new customers.',
      style: 'raw',
      status: 'published',
    },
  });

  await prisma.processVersion.create({
    data: {
      processId: p1.id,
      createdBy: user.id,
      style: 'steps',
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
  }).then(async (ver) => {
    await prisma.process.update({
      where: { id: p1.id },
      data: { publishedVersionId: ver.id },
    });
  });

  await prisma.processVersion.create({
    data: {
      processId: p2.id,
      createdBy: user.id,
      style: 'raw',
      contentJSON: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Collect basic identity documents and verify against provider.' }] },
        ],
      },
      contentText: 'Collect basic identity documents…',
    },
  }).then(async (ver) => {
    await prisma.process.update({
      where: { id: p2.id },
      data: { publishedVersionId: ver.id },
    });
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