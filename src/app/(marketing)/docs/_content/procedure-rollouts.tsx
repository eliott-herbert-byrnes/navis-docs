export function Content() {
  return (
    <>
      <h2>What a rollout is</h2>
      <p>
        A rollout is the notification and acknowledgment workflow that starts
        when a procedure is published with rollout options enabled. It helps
        admins make sure the right people know about an important procedure and
        can confirm they have read it.
      </p>
      <p>
        When you publish a procedure with notify, email, or news options
        enabled, Navis Docs creates a <code>ProcedureRollout</code>. That
        rollout records the target audience, drives notifications, and gives
        admins a way to track outstanding reads.
      </p>

      <h2>When to use rollouts</h2>
      <p>
        Rollouts are most useful when a procedure affects day-to-day work,
        compliance, safety, or training. For minor edits, you may publish
        without notifying everyone. For material changes, enable rollout options
        so members can see what needs their attention.
      </p>
      <ul>
        <li>New procedures that everyone in a team must understand</li>
        <li>Policy or compliance updates that require acknowledgment</li>
        <li>Operational changes that affect how staff complete work</li>
        <li>Training content that should be read before a process goes live</li>
      </ul>

      <h2>Notification channels</h2>
      <p>
        A rollout can reach staff through several channels depending on the
        publish options selected by the admin.
      </p>
      <ul>
        <li>
          <strong>In-app notifications</strong>: the sidebar shows an
          outstanding count so users can quickly find procedures they still need
          to read
        </li>
        <li>
          <strong>Email</strong>: Navis Docs can send a Resend batch email to
          the targeted users
        </li>
        <li>
          <strong>News post</strong>: Navis Docs can automatically create a
          related team news post when the procedure is published
        </li>
      </ul>
      <p>
        These channels can be combined. For example, a high-priority procedure
        might create an in-app outstanding item, send email, and appear as a
        news post so the team sees it in more than one place.
      </p>

      <h2>Target the right roles</h2>
      <p>
        Rollouts can be scoped by organization role. This lets admins announce a
        procedure to everyone or keep it limited to the group that needs to act
        on it.
      </p>
      <ul>
        <li>
          <strong>
            <code>ALL_USERS</code>
          </strong>
          : owners, admins, and members in scope
        </li>
        <li>
          <strong>
            <code>ADMINS_ONLY</code>
          </strong>
          : only admins and owners who need management context
        </li>
        <li>
          <strong>
            <code>MEMBERS_ONLY</code>
          </strong>
          : members who need to read and follow the procedure
        </li>
      </ul>
      <p>
        Choose the narrowest useful audience. A targeted rollout keeps
        outstanding lists meaningful and avoids asking people to acknowledge
        procedures that do not apply to them.
      </p>

      <h2>Acknowledgment and read tracking</h2>
      <p>
        Members acknowledge a rollout by marking the procedure as read. Navis
        Docs records that action as a <code>UserProcedureRead</code>, linking
        the user to the procedure version they read.
      </p>
      <p>
        Read tracking is tied to the published content. If a procedure changes
        and a new rollout is created, users may need to read the new version so
        their acknowledgment reflects the latest instructions.
      </p>

      <h2>Compliance status</h2>
      <p>
        A member is compliant when they have read all rollouts that apply to
        them. The outstanding counter in the sidebar reflects this same idea: it
        shows how many in-scope procedure reads still need attention.
      </p>
      <p>
        This gives each member a simple checklist of what remains, while giving
        admins a reliable view of whether important guidance has reached the
        team.
      </p>

      <h2>Admin visibility</h2>
      <p>
        Admins can review outstanding procedures per user. This helps identify
        who still needs to read a required procedure before a process, training
        requirement, or compliance deadline is considered complete.
      </p>
      <p>
        The outstanding view is powered by <code>getOutstandingForUser</code>,
        which compares a user's applicable rollouts with their recorded
        procedure reads.
      </p>

      <h2>Suggested rollout workflow</h2>
      <h3>1. Finish the procedure draft</h3>
      <p>
        Review the pending version and make sure the published content is ready
        for the target audience. Rollouts work best when the guidance is stable
        and clear.
      </p>

      <h3>2. Choose the audience</h3>
      <p>
        Decide whether the rollout should go to <code>ALL_USERS</code>,{" "}
        <code>ADMINS_ONLY</code>, or <code>MEMBERS_ONLY</code>. Match the scope
        to who needs to read or act on the procedure.
      </p>

      <h3>3. Select notification channels</h3>
      <p>
        Enable in-app notification, email, news post creation, or a combination
        of channels based on the importance of the update.
      </p>

      <h3>4. Monitor outstanding reads</h3>
      <p>
        After publishing, use the admin view to check who still has outstanding
        procedures. Members can clear their own outstanding count by reading and
        acknowledging the relevant procedures.
      </p>
    </>
  );
}
