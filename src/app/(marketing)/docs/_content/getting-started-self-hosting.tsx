export function Content() {
  return (
    <>
      <h2>Prerequisites</h2>
      <p>
        Before you run Navis Docs on your own servers, make sure you have the
        following available:
      </p>
      <ul>
        <li>Node.js 20 or newer</li>
        <li>
          <a href="https://pnpm.io/">pnpm</a> 10 or newer
        </li>
        <li>
          PostgreSQL 14+ with the{" "}
          <a href="https://github.com/pgvector/pgvector">pgvector</a> extension
        </li>
        <li>
          API keys for <strong>OpenAI</strong> (embeddings) and{" "}
          <strong>Anthropic</strong> (chat), unless you change the AI stack
        </li>
        <li>
          Optional: Upstash Redis for ratelimiting
        </li>
      </ul>
      <p>
        Postgres can run on bare metal, in Kubernetes, or via a managed
        provider (for example Supabase). Docker is optional but works well for
        local Postgres if you prefer containers.
      </p>

      <h2>Clone and install</h2>
      <p>Clone the repository and install JavaScript dependencies:</p>
      <pre>
        <code>{`git clone https://github.com/eliott-herbert-byrnes/navis-docs.git
cd navis-docs
pnpm install`}</code>
      </pre>

      <h2>Environment variables</h2>
      <p>
        Create a <code>.env</code> file at the project root. At minimum you
        need:
      </p>
      <ul>
        <li>
          <code>DATABASE_URL</code> — PostgreSQL connection string pointing at
          your database
        </li>
        <li>
          <code>NEXTAUTH_SECRET</code> and <code>NEXTAUTH_URL</code> — session
          configuration for authentication
        </li>
        <li>
          <code>OPENAI_API_KEY</code> and <code>ANTHROPIC_API_KEY</code> — used
          for semantic search and the assistant
        </li>
        <li>
          Email (<code>RESEND_API_KEY</code>, <code>EMAIL_FROM</code>) for
          invitations and transactional mail
        </li>
      </ul>
      <p>
        Copy variable names and examples from the project README if you need the
        full list, including optional Stripe and Upstash settings.
      </p>

      <h2>Database setup</h2>
      <p>
        Enable the <code>vector</code> extension in PostgreSQL (in Supabase:
        Database → Extensions). Then apply migrations and seed demo data:
      </p>
      <pre>
        <code>{`pnpm prisma migrate deploy
pnpm seed`}</code>
      </pre>

      <h2>Run the application</h2>
      <p>Start the development server:</p>
      <pre>
        <code>{`pnpm dev`}</code>
      </pre>
      <p>
        Open <a href="http://localhost:3000">http://localhost:3000</a> in your
        browser. For production, build with <code>pnpm build</code> and run{" "}
        <code>pnpm start</code> behind your reverse proxy or platform of
        choice, following your hosting provider’s guidance for Node.js apps.
      </p>
    </>
  );
}
