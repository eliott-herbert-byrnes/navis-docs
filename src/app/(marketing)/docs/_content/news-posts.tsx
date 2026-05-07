export function Content() {
  return (
    <>
      <h2>What news posts are</h2>
      <p>
        News posts are team-scoped announcements in Navis Docs. Admins use them
        to share updates, operational changes, reminders, and context that the
        whole team should see.
      </p>
      <p>
        Each team has its own news area, so announcements stay close to the
        procedures and working knowledge they relate to. Posts are stored as rich
        text using TipTap JSON, which keeps formatting structured and consistent.
      </p>

      <h2>When to use news</h2>
      <p>
        Use news posts for information that should be visible to a team but does
        not need to become a procedure itself.
      </p>
      <ul>
        <li>Announcing a change to how the team works</li>
        <li>Sharing a reminder about an upcoming operational deadline</li>
        <li>Highlighting a newly published or updated procedure</li>
        <li>Giving context around a policy, training, or compliance update</li>
      </ul>
      <p>
        If the update includes step-by-step instructions that members should use
        repeatedly, create or update a procedure as the source of truth and use a
        news post to announce the change.
      </p>

      <h2>Pinned posts</h2>
      <p>
        Admins can pin important posts so they stay prominent for the team.
        Pinning is useful for announcements that should remain easy to find, such
        as launch notices, temporary process changes, or time-sensitive guidance.
      </p>
      <p>
        Keep pinned posts current. Once an announcement no longer needs special
        attention, unpin it so newer high-priority updates can take its place.
      </p>

      <h2>Read receipts and unread counts</h2>
      <p>
        Navis Docs tracks when each member has seen a news post. That read
        receipt is recorded as a <code>UserNewsRead</code>, which links the user
        to the post they have read.
      </p>
      <p>
        Members see an unread count in the sidebar, making it easy to notice new
        announcements. Opening and reading the post clears it from that member's
        unread count.
      </p>

      <h2>How news connects to procedures</h2>
      <p>
        Procedure publishing can create a related news post automatically. When
        an admin enables <code>newsOnPublish</code>, Navis Docs creates a team
        news post as part of the publish workflow.
      </p>
      <p>
        This is useful when a procedure change should be both available in the
        knowledge base and announced to the team. For larger changes that need
        acknowledgment, combine news with a rollout. See{" "}
        <a href="/docs/procedure-rollouts">Procedure Rollouts</a> for more
        detail.
      </p>

      <h2>Permissions</h2>
      <p>
        News creation and deletion are admin-only actions. Admins and owners can
        create posts, pin announcements, remove posts when needed, and decide
        whether publishing a procedure should also create a news post.
      </p>
      <p>
        Members read team news and mark posts as read. This keeps everyday news
        consumption simple while preserving admin control over official team
        announcements.
      </p>

      <h2>Suggested news workflow</h2>
      <h3>1. Choose the right team</h3>
      <p>
        Create the post in the team that owns the announcement. If an update
        applies to multiple teams, write separate posts so each team receives the
        right context.
      </p>

      <h3>2. Write the announcement</h3>
      <p>
        Keep the post focused on what changed, who it affects, and what members
        should do next. Link to the relevant procedure when the announcement
        depends on detailed instructions.
      </p>

      <h3>3. Pin only when needed</h3>
      <p>
        Pin the post if it should remain highly visible. For routine updates,
        leave it unpinned so the news feed stays chronological.
      </p>

      <h3>4. Review read progress</h3>
      <p>
        Use unread counts and read receipts to understand whether the team has
        seen the announcement. For updates that require formal acknowledgment,
        publish a procedure rollout instead of relying on news alone.
      </p>
    </>
  );
}
