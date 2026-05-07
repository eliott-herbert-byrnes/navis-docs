export function Content() {
  return (
    <>
      <h2>What a procedure is</h2>
      <p>
        Procedures are the core content in Navis Docs. A procedure can be a
        freeform guide, a numbered checklist, a branching workflow, or a
        decision tree. Each team builds its own collection of procedures, and
        that collection becomes the team's knowledge base.
      </p>
      <p>
        Procedures live inside teams and can be grouped by category so members
        can find the right guidance quickly. Admins usually create the
        categories first, then add procedures as the team's operating knowledge
        grows.
      </p>

      <h2>Choose a procedure format</h2>
      <p>
        Pick the format that matches the kind of work you are documenting. You
        can keep simple guidance lightweight, while giving high-risk processes
        more structure.
      </p>
      <ul>
        <li>
          <strong>
            <code>RAW</code>
          </strong>
          : freeform rich text for policies, reference material, and narrative
          guides
        </li>
        <li>
          <strong>
            <code>STEPS</code>
          </strong>
          : numbered steps for repeatable tasks, checks, and operational
          runbooks
        </li>
        <li>
          <strong>
            <code>FLOW</code>
          </strong>
          : branching workflows where the next action depends on context or
          previous answers
        </li>
        <li>
          <strong>
            <code>YESNO</code>
          </strong>
          : decision trees for questions that can be resolved through yes/no
          branches
        </li>
      </ul>

      <h2>Drafts and publishing</h2>
      <p>
        Every procedure has a draft version and, once published, a live version.
        Internally these are tracked as <code>pendingVersionId</code> and{" "}
        <code>publishedVersionId</code>.
      </p>
      <p>
        Editing a draft never changes what members see. You can revise the
        pending version, review it with other admins, and publish only when it
        is ready. Publishing promotes the draft into the live procedure that
        members read.
      </p>

      <h2>Procedure statuses</h2>
      <p>
        A procedure moves through a small set of statuses during its lifecycle:
      </p>
      <ul>
        <li>
          <strong>
            <code>DRAFT</code>
          </strong>
          : the procedure is being written and is not live for members yet
        </li>
        <li>
          <strong>
            <code>PUBLISHED</code>
          </strong>
          : the procedure has a live version members can use
        </li>
        <li>
          <strong>
            <code>ARCHIVED</code>
          </strong>
          : the procedure is retained for history but removed from everyday use
        </li>
      </ul>

      <h2>Version history</h2>
      <p>
        Each publish creates a new <code>ProcedureVersion</code>. The content is
        stored as <code>contentJSON</code>, which preserves the structured data
        for the chosen format.
      </p>
      <p>
        Full history is retained, so teams can see how a procedure changed over
        time. This is useful for compliance reviews, operational learning, and
        understanding which version was live when a member used a procedure.
      </p>

      <h2>Organize with categories</h2>
      <p>
        Categories group procedures within a team. Admins create categories to
        match how members think about the work, such as onboarding, safety,
        customer support, incident response, or finance operations.
      </p>
      <p>
        Keep categories broad enough to stay useful as the team grows. A small
        set of clear categories is usually easier for members than a long list
        of narrow folders.
      </p>

      <h2>Gather ideas from members</h2>
      <p>
        Members can submit procedure suggestions from the Ideas panel in the
        sidebar. This gives frontline users a simple way to flag missing
        guidance, unclear instructions, or processes that should be documented.
      </p>
      <p>Admins triage ideas using these statuses:</p>
      <ul>
        <li>
          <code>NEW</code>
        </li>
        <li>
          <code>IN_PROGRESS</code>
        </li>
        <li>
          <code>COMPLETED</code>
        </li>
        <li>
          <code>ARCHIVED</code>
        </li>
      </ul>
      <p>
        When an idea becomes a procedure, publish it like any other procedure so
        the team gets a stable live version and a retained version history.
      </p>

      <h2>Publish and notify</h2>
      <p>
        When you publish, you can choose rollout and notification options. These
        options can notify staff in-app, send email, and create a related news
        post depending on how the publish action is configured.
      </p>
      <p>
        Rollouts are useful when a procedure needs acknowledgment or when a
        change affects compliance. For more detail, see{" "}
        <a href="/docs/procedure-rollouts">Procedure Rollouts</a>.
      </p>

      <h2>Suggested creation workflow</h2>
      <h3>1. Pick the team and category</h3>
      <p>
        Start where members will look for the procedure. Choose the team that
        owns the work, then place the procedure in the closest matching
        category.
      </p>

      <h3>2. Select the format</h3>
      <p>
        Use <code>RAW</code> for flexible guidance, <code>STEPS</code> for
        checklists, <code>FLOW</code> for branching workflows, and{" "}
        <code>YESNO</code> for decision trees.
      </p>

      <h3>3. Write and review the draft</h3>
      <p>
        Build the pending version, check that each instruction is clear, and ask
        another admin or subject-matter expert to review high-impact procedures.
      </p>

      <h3>4. Publish when ready</h3>
      <p>
        Publishing creates a new version and makes it live for members. If the
        procedure needs attention from the team, enable the appropriate rollout
        and notification options before publishing.
      </p>
    </>
  );
}
