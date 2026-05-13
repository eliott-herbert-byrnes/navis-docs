export function Content() {
  return (
    <>
      <h2>What happens when you sign in</h2>
      <p>
        Navis Docs is designed so a new workspace is ready as soon as you
        arrive. You can sign in with Google OAuth or use an email one-time
        passcode. There is no password to create or manage.
      </p>
      <p>
        On your first sign-in, Navis Docs creates an organization for you
        automatically and places you inside it. From there you can create the
        structure your team needs, invite colleagues, and start building your
        procedure knowledge base.
      </p>

      <h2>Workspace structure</h2>
      <p>
        Navis Docs organizes content around the way operational teams actually
        work:
      </p>
      <ul>
        <li>
          <strong>Organization</strong>: the top-level workspace for billing,
          ownership, users, departments, and settings
        </li>
        <li>
          <strong>Department</strong>: a major area of the business, such as
          Operations, Support, Compliance, or Finance
        </li>
        <li>
          <strong>Team</strong>: a working group inside a department with its
          own procedures, categories, news, and AI chat
        </li>
        <li>
          <strong>Procedures</strong>: the team's collection of guides,
          checklists, and decision flows
        </li>
      </ul>
      <p>
        You do not need to create a separate knowledge base. A team's procedure
        collection is its knowledge base, and each team can organize procedures
        into categories that match how its members search for answers.
      </p>

      <h2>Roles and permissions</h2>
      <p>
        Each user has a role in the organization. Assign the least-powerful role
        that still lets someone do their job.
      </p>
      <ul>
        <li>
          <strong>OWNER</strong>: controls organization ownership, billing, and
          ownership transfer
        </li>
        <li>
          <strong>ADMIN</strong>: manages departments, teams, procedures,
          categories, invitations, users, and organization settings
        </li>
        <li>
          <strong>MEMBER</strong>: reads procedures, contributes where allowed,
          acknowledges rollouts, and submits ideas
        </li>
      </ul>
      <p>
        Owners and admins see management areas that members do not, including
        user management, audit log, and billing navigation items. Members get a
        focused workspace for the teams and procedures relevant to them.
      </p>

      <h2>Invite your team</h2>
      <p>
        Admins and owners can invite users by email from the organization user
        management area. Choose the invitee's role at invite time so their
        permissions are correct when they accept.
      </p>
      <p>
        After accepting an invitation, the user signs in with Google or email
        OTP and lands in the organization they were invited to. You can adjust
        roles later as responsibilities change.
      </p>

      <h2>Access, trial, and billing</h2>
      <p>
        Organization features are available while the organization has active
        access. In practice, that means an active or trialing Stripe
        subscription. If access expires, gated product areas are restricted
        until billing is restored.
      </p>
      <p>
        To compare plans or start a subscription, visit the{" "}
        <a href="/pricing">pricing page</a>. Owners handle billing because they
        are responsible for the organization's subscription and long-term
        ownership.
      </p>

      <h2>Suggested first setup path</h2>
      <h3>1. Confirm your organization</h3>
      <p>
        After signing in, check the organization name and settings. If you are
        evaluating Navis Docs, this is also a good time to review your plan or
        trial status.
      </p>

      <h3>2. Add departments and teams</h3>
      <p>
        Create the departments that mirror your business, then add teams inside
        them. Start with the teams that need procedures most urgently rather
        than modelling every department on day one.
      </p>

      <h3>3. Invite admins first</h3>
      <p>
        Bring in the people who will help structure content and manage users.
        Give them the <code>ADMIN</code> role if they need management access, or
        keep them as <code>MEMBER</code> if they only need to read and
        contribute.
      </p>

      <h3>4. Create your first procedures</h3>
      <p>
        Add a few high-value procedures to each team and publish them when they
        are ready for members. Once a team has useful procedures, invite the
        wider group and begin using Navis Docs as the source of truth.
      </p>
    </>
  );
}
