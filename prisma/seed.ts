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
    create: { id: org.id.slice(0, 24) + '-dept-a', orgId: org.id, name: 'Customer Operations' },
  });
  const dept2 = await prisma.department.upsert({
    where: { id: org.id.slice(0, 24) + '-dept-b' },
    update: {},
    create: { id: org.id.slice(0, 24) + '-dept-b', orgId: org.id, name: 'Compliance & Risk' },
  });

  const teamOps = await prisma.team.create({
    data: { departmentId: dept1.id, name: 'Account Services' },
  });
  const teamComp = await prisma.team.create({
    data: { departmentId: dept2.id, name: 'Verification & Fraud' },
  });

  const catPayments = await prisma.category.create({
    data: { teamId: teamOps.id, name: 'Payment Processing', sortOrder: 1 },
  });
  const catAccounts = await prisma.category.create({
    data: { teamId: teamOps.id, name: 'Account Management', sortOrder: 2 },
  });
  const catCompliance = await prisma.category.create({
    data: { teamId: teamComp.id, name: 'Identity Verification', sortOrder: 1 },
  });
  const catFraud = await prisma.category.create({
    data: { teamId: teamComp.id, name: 'Fraud Detection', sortOrder: 2 },
  });

  const p1 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catCompliance.id,
      slug: 'kyc-basic-check',
      title: 'KYC Basic Check',
      description: 'Standard Know Your Customer verification process for new account holders.',
      style: ProcessStyle.RAW,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p2 = await prisma.process.create({
    data: {
      teamId: teamOps.id,
      categoryId: catAccounts.id,
      slug: 'account-closure-procedure',
      title: 'Account Closure Procedure',
      description: 'Complete process for safely closing customer accounts.',
      style: ProcessStyle.RAW,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p3 = await prisma.process.create({
    data: {
      teamId: teamOps.id,
      categoryId: catPayments.id,
      slug: 'setup-direct-debit',
      title: 'Setup Direct Debit',
      description: 'Step-by-step guide to setting up recurring direct debit payments.',
      style: ProcessStyle.STEPS,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p4 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catCompliance.id,
      slug: 'credit-card-application-review',
      title: 'Credit Card Application Review',
      description: 'Structured steps for reviewing and processing credit card applications.',
      style: ProcessStyle.STEPS,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p5 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catFraud.id,
      slug: 'fraud-investigation-workflow',
      title: 'Fraud Investigation Workflow',
      description: 'Complete workflow for investigating suspicious account activity.',
      style: ProcessStyle.FLOW,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p6 = await prisma.process.create({
    data: {
      teamId: teamOps.id,
      categoryId: catAccounts.id,
      slug: 'loan-approval-process',
      title: 'Loan Approval Process',
      description: 'End-to-end workflow for personal loan application processing.',
      style: ProcessStyle.FLOW,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p7 = await prisma.process.create({
    data: {
      teamId: teamOps.id,
      categoryId: catAccounts.id,
      slug: 'customer-complaint-resolution',
      title: 'Customer Complaint Resolution',
      description: 'Decision tree for handling and resolving customer complaints.',
      style: ProcessStyle.YESNO,
      status: ProcessStatus.PUBLISHED,
    },
  });

  const p8 = await prisma.process.create({
    data: {
      teamId: teamComp.id,
      categoryId: catFraud.id,
      slug: 'transaction-dispute-assessment',
      title: 'Transaction Dispute Assessment',
      description: 'Guided decision process for evaluating transaction disputes.',
      style: ProcessStyle.YESNO,
      status: ProcessStatus.PUBLISHED,
    },
  });

  
  const pv1 = await prisma.processVersion.create({
    data: {
      processId: p1.id,
      createdBy: user.id,
      style: ProcessStyle.RAW,
      contentJSON: {
        tiptap: {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'KYC Basic Check' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'This process outlines the standard Know Your Customer (KYC) verification requirements for all new customers opening accounts.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Required Documents' }] },
            { type: 'bulletList', content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Valid government-issued photo ID (passport, driver\'s license, or national ID card)' }]}]},
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Proof of address (utility bill, bank statement, or rental agreement) dated within last 3 months' }]}]},
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tax identification number or equivalent' }]}]},
            ]},
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Verification Steps' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '1. Verify customer identity against photo ID using electronic verification system' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '2. Cross-check address details with proof of address document' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '3. Screen customer against sanctions lists and PEP databases' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '4. Obtain customer signature on compliance declarations' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '5. Update customer record with verification status and documents' }] },
          ],
        },
      },
      contentText: 'KYC verification process for new customers',
    },
  });

  const pv2 = await prisma.processVersion.create({
    data: {
      processId: p2.id,
      createdBy: user.id,
      style: ProcessStyle.RAW,
      contentJSON: {
        tiptap: {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Account Closure Procedure' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Follow these guidelines when processing customer account closure requests.' }] },
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Pre-Closure Checks' }] },
            { type: 'bulletList', content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Verify customer identity through security questions' }]}]},
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Check for outstanding balances, pending transactions, or scheduled payments' }]}]},
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Review for any active direct debits or standing orders' }]}]},
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Confirm no linked products (loans, credit cards, overdrafts)' }]}]},
            ]},
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Closure Process' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Cancel all direct debits and standing orders. Transfer remaining balance to nominated account. Generate final statement. Archive account records per data retention policy. Send closure confirmation to customer.' }] },
          ],
        },
      },
      contentText: 'Account closure guidelines',
    },
  });

  const pv3 = await prisma.processVersion.create({
    data: {
      processId: p3.id,
      createdBy: user.id,
      style: ProcessStyle.STEPS,
      contentJSON: {
        steps: [
          { id: 'step-1', title: 'Verify Customer Account', description: 'Log into the banking system and locate the customer\'s account. Confirm account is active and in good standing with no restrictions.', isExpanded: false },
          { id: 'step-2', title: 'Check Existing Direct Debits', description: 'Review the current direct debit list to ensure no duplicate payment setup exists. If found, inform customer and follow amendment process instead.', isExpanded: false },
          { id: 'step-3', title: 'Collect Direct Debit Details', description: 'Obtain the following from customer: Payee name and reference, Payment amount and frequency, Start date for first payment, Account to debit from.', isExpanded: false },
          { id: 'step-4', title: 'Enter Direct Debit in System', description: 'Navigate to Direct Debit section in banking system. Enter all collected details accurately. Set up payment schedule according to customer requirements.', isExpanded: false },
          { id: 'step-5', title: 'Obtain Customer Authorization', description: 'Generate Direct Debit mandate form. Have customer review and sign authorization. Scan and attach signed mandate to customer file.', isExpanded: false },
          { id: 'step-6', title: 'Confirm Setup', description: 'Save the direct debit configuration. Send confirmation email to customer with setup details. Set reminder for first payment date to monitor successful execution.', isExpanded: false },
        ],
      },
      contentText: 'Direct debit setup process',
    },
  });

  const pv4 = await prisma.processVersion.create({
    data: {
      processId: p4.id,
      createdBy: user.id,
      style: ProcessStyle.STEPS,
      contentJSON: {
        steps: [
          { id: 'step-1', title: 'Receive Application', description: 'Accept credit card application through online portal, branch, or phone. Ensure all mandatory fields are completed with accurate information.', isExpanded: false },
          { id: 'step-2', title: 'Verify Identity', description: 'Perform KYC checks as per standard process. Verify applicant identity using photo ID and proof of address. Check against sanctions and fraud databases.', isExpanded: false },
          { id: 'step-3', title: 'Assess Credit Score', description: 'Pull credit report from approved credit bureau. Review credit score and payment history. Check for any defaults, CCJs, or bankruptcies.', isExpanded: false },
          { id: 'step-4', title: 'Evaluate Income & Employment', description: 'Verify stated income against provided payslips or bank statements. Confirm employment status and length of employment. Calculate debt-to-income ratio.', isExpanded: false },
          { id: 'step-5', title: 'Determine Credit Limit', description: 'Use automated decisioning system to calculate appropriate credit limit. Consider income, existing debts, and credit score. Apply risk-based pricing for interest rate.', isExpanded: false },
          { id: 'step-6', title: 'Make Decision & Notify', description: 'Approve, decline, or refer to manual underwriting. Send decision notification to applicant. If approved, initiate card production and dispatch. If declined, provide decline reasons as per regulations.', isExpanded: false },
        ],
      },
      contentText: 'Credit card application review steps',
    },
  });

  const pv5 = await prisma.processVersion.create({
    data: {
      processId: p5.id,
      createdBy: user.id,
      style: ProcessStyle.FLOW,
      contentJSON: {
        flow: {
          nodes: [
            { id: '1', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Fraud Alert Received' } },
            { id: '2', type: 'step', position: { x: 250, y: 80 }, data: { label: 'Freeze Account' } },
            { id: '3', type: 'step', position: { x: 250, y: 160 }, data: { label: 'Review Transaction History' } },
            { id: '4', type: 'decision', position: { x: 250, y: 240 }, data: { label: 'Fraud Confirmed?' } },
            { id: '5', type: 'step', position: { x: 100, y: 340 }, data: { label: 'Contact Customer' } },
            { id: '6', type: 'step', position: { x: 400, y: 340 }, data: { label: 'Document False Alarm' } },
            { id: '7', type: 'step', position: { x: 100, y: 420 }, data: { label: 'File Police Report' } },
            { id: '8', type: 'step', position: { x: 400, y: 420 }, data: { label: 'Unfreeze Account' } },
            { id: '9', type: 'step', position: { x: 100, y: 500 }, data: { label: 'Issue Refund' } },
            { id: '10', type: 'end', position: { x: 250, y: 580 }, data: { label: 'Case Closed' } },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5', label: 'Yes' },
            { id: 'e4-6', source: '4', target: '6', label: 'No' },
            { id: 'e5-7', source: '5', target: '7' },
            { id: 'e6-8', source: '6', target: '8' },
            { id: 'e7-9', source: '7', target: '9' },
            { id: 'e8-10', source: '8', target: '10' },
            { id: 'e9-10', source: '9', target: '10' },
          ],
        },
      },
      contentText: 'Fraud investigation workflow',
    },
  });

  const pv6 = await prisma.processVersion.create({
    data: {
      processId: p6.id,
      createdBy: user.id,
      style: ProcessStyle.FLOW,
      contentJSON: {
        flow: {
          nodes: [
            { id: '1', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Loan Application' } },
            { id: '2', type: 'step', position: { x: 250, y: 80 }, data: { label: 'Collect Documents' } },
            { id: '3', type: 'step', position: { x: 250, y: 160 }, data: { label: 'Credit Check' } },
            { id: '4', type: 'decision', position: { x: 250, y: 240 }, data: { label: 'Score > 650?' } },
            { id: '5', type: 'step', position: { x: 100, y: 340 }, data: { label: 'Income Verification' } },
            { id: '6', type: 'step', position: { x: 400, y: 340 }, data: { label: 'Send Decline Letter' } },
            { id: '7', type: 'decision', position: { x: 100, y: 440 }, data: { label: 'DTI < 43%?' } },
            { id: '8', type: 'step', position: { x: 0, y: 540 }, data: { label: 'Approve Loan' } },
            { id: '9', type: 'step', position: { x: 200, y: 540 }, data: { label: 'Manual Review' } },
            { id: '10', type: 'end', position: { x: 250, y: 640 }, data: { label: 'Process Complete' } },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5', label: 'Yes' },
            { id: 'e4-6', source: '4', target: '6', label: 'No' },
            { id: 'e5-7', source: '5', target: '7' },
            { id: 'e6-10', source: '6', target: '10' },
            { id: 'e7-8', source: '7', target: '8', label: 'Yes' },
            { id: 'e7-9', source: '7', target: '9', label: 'No' },
            { id: 'e8-10', source: '8', target: '10' },
            { id: 'e9-10', source: '9', target: '10' },
          ],
        },
      },
      contentText: 'Loan approval workflow',
    },
  });

  const pv7 = await prisma.processVersion.create({
    data: {
      processId: p7.id,
      createdBy: user.id,
      style: ProcessStyle.YESNO,
      contentJSON: {
        yesno: {
          nodes: [
            { id: 'start', question: 'Customer Complaint Resolution', description: 'Begin complaint assessment process', yesNodeId: 'type' },
            { id: 'type', question: 'Is this a service complaint?', description: 'Service complaints relate to staff behavior, wait times, or service quality', yesNodeId: 'service-severe', noNodeId: 'financial' },
            { id: 'service-severe', question: 'Is the issue severe?', description: 'Severe issues include discrimination, abuse, or gross negligence', yesNodeId: 'escalate-manager', noNodeId: 'service-resolve' },
            { id: 'escalate-manager', question: 'Escalate to Branch Manager', description: 'Immediately escalate to branch manager for investigation. Document all details and maintain customer contact.', isEndNode: true, endMessage: 'Manager will contact customer within 24 hours' },
            { id: 'service-resolve', question: 'Resolve Service Issue', description: 'Apologize to customer. Offer compensation if appropriate (fee waiver, goodwill gesture). Document resolution in CRM.', isEndNode: true, endMessage: 'Issue resolved - follow up in 48 hours' },
            { id: 'financial', question: 'Does it involve incorrect charges?', description: 'Incorrect charges include wrong fees, unauthorized debits, or calculation errors', yesNodeId: 'investigate-charges', noNodeId: 'product-issue' },
            { id: 'investigate-charges', question: 'Can charges be verified as incorrect?', description: 'Review transaction history and account terms. Check for system errors or processing mistakes.', yesNodeId: 'refund-charges', noNodeId: 'explain-charges' },
            { id: 'refund-charges', question: 'Process Refund', description: 'Issue immediate refund for incorrect charges. Add goodwill credit if customer experienced hardship. Update account notes.', isEndNode: true, endMessage: 'Refund processed - customer notified' },
            { id: 'explain-charges', question: 'Explain Charges', description: 'Clearly explain the charges with reference to account terms. Provide breakdown and documentation. Offer to review account type if beneficial.', isEndNode: true, endMessage: 'Explanation provided - case closed' },
            { id: 'product-issue', question: 'Issue with Product Features', description: 'Explain product features and limitations. If legitimate gap, escalate to product team. Offer alternative products if appropriate.', isEndNode: true, endMessage: 'Product explanation provided or alternative suggested' },
          ],
          startNodeId: 'start',
        },
      },
      contentText: 'Customer complaint resolution guide',
    },
  });

  const pv8 = await prisma.processVersion.create({
    data: {
      processId: p8.id,
      createdBy: user.id,
      style: ProcessStyle.YESNO,
      contentJSON: {
        yesno: {
          nodes: [
            { id: 'start', question: 'Transaction Dispute Assessment', description: 'Start dispute evaluation process', yesNodeId: 'reported-timeframe' },
            { id: 'reported-timeframe', question: 'Was dispute reported within 60 days?', description: 'Regulation E requires reporting within 60 days of statement date', yesNodeId: 'transaction-type', noNodeId: 'deny-timeframe' },
            { id: 'deny-timeframe', question: 'Deny Dispute - Late Report', description: 'Inform customer that dispute is outside the allowable timeframe per regulations. Provide statement of rights.', isEndNode: true, endMessage: 'Dispute denied - reported too late' },
            { id: 'transaction-type', question: 'Is this a debit card transaction?', description: 'Different rules apply for debit vs credit card transactions', yesNodeId: 'debit-fraud', noNodeId: 'credit-dispute' },
            { id: 'debit-fraud', question: 'Customer claims fraud/unauthorized?', description: 'Unauthorized means customer did not initiate or authorize the transaction', yesNodeId: 'provisional-credit', noNodeId: 'debit-merchant' },
            { id: 'provisional-credit', question: 'Issue Provisional Credit', description: 'Provide temporary credit within 10 business days. Cancel card and issue replacement. File fraud report with network. Begin investigation.', isEndNode: true, endMessage: 'Provisional credit issued - investigation ongoing' },
            { id: 'debit-merchant', question: 'Merchant Dispute', description: 'Contact merchant for transaction details. Request proof of authorization. If unresolved, initiate chargeback through card network.', isEndNode: true, endMessage: 'Chargeback initiated - 45 days to resolve' },
            { id: 'credit-dispute', question: 'Billing error or fraud?', description: 'Billing errors include incorrect amounts, undelivered goods, or calculation errors', yesNodeId: 'credit-fraud-check', noNodeId: 'billing-error' },
            { id: 'credit-fraud-check', question: 'Evidence of fraud?', description: 'Check for: multiple suspicious charges, unfamiliar merchants, international transactions, pattern inconsistent with customer history', yesNodeId: 'freeze-card', noNodeId: 'request-docs' },
            { id: 'freeze-card', question: 'Freeze Card & Investigate', description: 'Immediately freeze credit card. Issue emergency replacement. Remove fraudulent charges. File police report if amount exceeds threshold.', isEndNode: true, endMessage: 'Card frozen - charges reversed' },
            { id: 'request-docs', question: 'Request Documentation', description: 'Ask customer for receipts, emails, contracts, or other proof. Give 30 days to provide evidence. Review upon receipt.', isEndNode: true, endMessage: 'Awaiting documentation from customer' },
            { id: 'billing-error', question: 'Verify Billing Error', description: 'Review transaction against purchase records. Confirm amount and merchant. Check for duplicate charges or errors.', isEndNode: true, endMessage: 'Billing error verified - adjustment made' },
          ],
          startNodeId: 'start',
        },
      },
      contentText: 'Transaction dispute assessment',
    },
  });

  await prisma.process.update({ where: { id: p1.id }, data: { publishedVersionId: pv1.id, pendingVersionId: pv1.id } });
  await prisma.process.update({ where: { id: p2.id }, data: { publishedVersionId: pv2.id, pendingVersionId: pv2.id } });
  await prisma.process.update({ where: { id: p3.id }, data: { publishedVersionId: pv3.id, pendingVersionId: pv3.id } });
  await prisma.process.update({ where: { id: p4.id }, data: { publishedVersionId: pv4.id, pendingVersionId: pv4.id } });
  await prisma.process.update({ where: { id: p5.id }, data: { publishedVersionId: pv5.id, pendingVersionId: pv5.id } });
  await prisma.process.update({ where: { id: p6.id }, data: { publishedVersionId: pv6.id, pendingVersionId: pv6.id } });
  await prisma.process.update({ where: { id: p7.id }, data: { publishedVersionId: pv7.id, pendingVersionId: pv7.id } });
  await prisma.process.update({ where: { id: p8.id }, data: { publishedVersionId: pv8.id, pendingVersionId: pv8.id } });

  await prisma.newsPost.create({
    data: {
      teamId: teamOps.id,
      title: 'Updated Compliance Procedures - Q4 2024',
      bodyJSON: { 
        type: 'doc', 
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'All team members: Please review the updated KYC and fraud detection procedures. New regulatory requirements from the Financial Conduct Authority are now in effect.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Key changes: Enhanced identity verification for high-risk customers, revised transaction monitoring thresholds, and updated customer complaint handling timelines.' }] }
        ] 
      },
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
