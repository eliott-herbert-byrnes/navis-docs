export function Content() {
  return (
    <>
      <h2>What the audit log is</h2>
      <p>
        The audit log records important activity across an organization. It
        gives admins a searchable history of operational changes, who made them,
        and when they happened.
      </p>
      <p>
        Audit logging is designed for accountability and compliance. It helps
        teams review configuration changes, investigate unexpected updates, and
        produce a record of activity when required.
      </p>

      <h2>What is logged</h2>
      <p>
        Navis Docs records lifecycle events for the main objects that shape an
        organization and its knowledge base.
      </p>
      <ul>
        <li>Departments and teams</li>
        <li>Procedures, procedure versions, categories, and rollouts</li>
        <li>Users, invitations, and role changes</li>
        <li>Organization settings and billing-related management actions</li>
        <li>News posts and related team announcements</li>
        <li>Audit export requests and export completion events</li>
      </ul>
      <p>
        Where relevant, events include before and after JSON snapshots. These
        snapshots make it easier to understand exactly what changed, not just
        that a change occurred.
      </p>

      <h2>Where to find it</h2>
      <p>
        Admins can open the Audit Log page from the main navigation. Members do
        not see the audit log navigation item and cannot access audit records.
      </p>
      <p>
        Because the log can include sensitive operational history, keep audit
        log access limited to users who need organization management or
        compliance responsibilities.
      </p>

      <h2>Filtering events</h2>
      <p>
        The Audit Log page includes filters so admins can narrow the history to
        the records they need.
      </p>
      <ul>
        <li>
          <strong>Entity type</strong>: focus on areas such as procedures,
          users, departments, teams, news, or rollouts
        </li>
        <li>
          <strong>Actor</strong>: review activity performed by a specific user
        </li>
        <li>
          <strong>Date range</strong>: limit results to the time window relevant
          to an investigation or review
        </li>
      </ul>
      <p>
        Combining filters is useful during investigations. For example, an admin
        can filter to procedure events performed by one actor during the week a
        policy changed.
      </p>

      <h2>Exporting audit records</h2>
      <p>
        Admins can request an audit export when they need an offline record or a
        file for compliance review. Exports are generated asynchronously so
        large requests do not block normal app usage.
      </p>
      <p>The export job moves through these statuses:</p>
      <ul>
        <li>
          <code>QUEUED</code>
        </li>
        <li>
          <code>PROCESSING</code>
        </li>
        <li>
          <code>READY</code>
        </li>
      </ul>
      <p>
        When the export is ready, Navis Docs provides a signed download URL for
        the generated JSON file. Export activity is itself audited with events
        such as <code>AUDIT_EXPORT_REQUESTED</code> and{" "}
        <code>AUDIT_EXPORT_READY</code>.
      </p>

      <h2>Access control</h2>
      <p>
        The audit log is admin-only. Owners and admins can review records and
        request exports. Members cannot access the page, run filters, or
        download export files.
      </p>
      <p>
        Treat exports with the same care as the in-app audit log. Downloaded
        JSON files may contain sensitive information about users, organization
        configuration, and operational changes.
      </p>

      <h2>Suggested review workflow</h2>
      <h3>1. Start with the question</h3>
      <p>
        Decide what you are trying to understand, such as who changed a
        procedure, when an invitation was sent, or how a department was
        restructured.
      </p>

      <h3>2. Apply focused filters</h3>
      <p>
        Filter by entity type, actor, and date range to reduce noise. Start
        narrow, then widen the filters if the expected event does not appear.
      </p>

      <h3>3. Review before and after data</h3>
      <p>
        For events with snapshots, compare the before and after JSON to
        understand the actual change. This is especially useful for procedure,
        role, and settings updates.
      </p>

      <h3>4. Export when a record is needed</h3>
      <p>
        Request an export when you need to share or archive audit history. Wait
        for the job to reach <code>READY</code>, then use the signed URL to
        download the JSON file.
      </p>
    </>
  );
}
