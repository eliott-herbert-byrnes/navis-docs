export function Content() {
  return (
    <>
      <h2>Prerequisites</h2>
      <p>
        This guide walks through a Docker Compose deployment of Navis Docs. It
        is intended for teams who want to run the app on their own server or
        behind an existing reverse proxy.
      </p>
      <ul>
        <li>
          Docker Engine with Docker Compose. Docker 23 or newer is recommended
          because BuildKit is enabled by default.
        </li>
        <li>
          A reverse proxy such as Nginx, Caddy, Traefik, or your platform proxy
        </li>
        <li>
          Object storage credentials from either Supabase Storage or an
          S3-compatible provider
        </li>
        <li>
          Resend credentials for email sign-in, invitations, and transactional
          mail
        </li>
        <li>Optional: Google OAuth credentials if you want Google sign-in</li>
      </ul>
      <p>
        The bundled Compose file starts the app, Postgres with pgvector, and
        Redis. It exposes the app on port <code>3000</code>.
      </p>

      <h2>Setup steps</h2>

      <h3>1. Clone the repository</h3>
      <p>Clone Navis Docs onto the server where you will run Docker Compose:</p>
      <pre>
        <code>{`git clone https://github.com/navis-docs/navis-docs.git
cd navis-docs`}</code>
      </pre>

      <h3>2. Create your environment file</h3>
      <p>Copy the example file, then edit it with your production values:</p>
      <pre>
        <code>{`cp .env.example .env`}</code>
      </pre>
      <p>
        For the bundled Docker Compose database and Redis services, make sure
        these URLs use the service names <code>db</code> and <code>redis</code>:
      </p>
      <pre>
        <code>{`DATABASE_URL=postgresql://postgres:password@db:5432/navis_docs
REDIS_URL=redis://redis:6379`}</code>
      </pre>
      <p>At minimum, also set:</p>
      <ul>
        <li>
          <code>NEXT_PUBLIC_APP_URL</code> and <code>NEXTAUTH_URL</code> to your
          public URL, for example <code>https://docs.your-domain.com</code>
        </li>
        <li>
          <code>AUTH_SECRET</code> for Auth.js session signing
        </li>
        <li>
          <code>AI_KEY_ENCRYPTION_SECRET</code> for organization-provided AI API
          keys encrypted in the database
        </li>
        <li>
          <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> for email
        </li>
        <li>Storage provider credentials, covered below</li>
      </ul>

      <h3>3. Generate secrets</h3>
      <p>
        Generate separate values for <code>AUTH_SECRET</code> and{" "}
        <code>AI_KEY_ENCRYPTION_SECRET</code>:
      </p>
      <pre>
        <code>{`openssl rand -base64 32`}</code>
      </pre>
      <p>
        Keep <code>AI_KEY_ENCRYPTION_SECRET</code> backed up. If it changes,
        existing encrypted AI keys in the database become permanently unreadable
        and must be re-entered.
      </p>

      <h3>4. Choose storage</h3>
      <p>
        Navis Docs needs object storage for procedure images, procedure imports,
        and audit exports. Choose either Supabase Storage or S3-compatible
        storage.
      </p>

      <h4>S3-compatible storage</h4>
      <p>
        Use this option for AWS S3, Cloudflare R2, Garage, MinIO, and similar
        providers. Create the three buckets first, then set:
      </p>
      <pre>
        <code>{`STORAGE_PROVIDER=s3
S3_ENDPOINT=              # leave blank for AWS S3; set for R2, Garage, or MinIO
S3_REGION=auto            # use your AWS region for AWS S3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PROCEDURE_IMAGES_BUCKET=procedure-images
S3_PROCEDURE_IMPORTS_BUCKET=procedure-imports
S3_PROCEDURE_AUDITS_BUCKET=audit-exports`}</code>
      </pre>
      <p>
        For many MinIO and Garage deployments, also set{" "}
        <code>S3_FORCE_PATH_STYLE=true</code>.
      </p>

      <h4>Supabase Storage</h4>
      <p>
        Use this option if you already have a Supabase project and want to store
        files there:
      </p>
      <pre>
        <code>{`STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`}</code>
      </pre>
      <p>Create these Supabase Storage buckets:</p>
      <ul>
        <li>
          <code>procedure-images</code>
        </li>
        <li>
          <code>procedure-imports</code>
        </li>
        <li>
          <code>audit-exports</code>
        </li>
      </ul>

      <h3>5. Configure Google OAuth</h3>
      <p>
        If you want Google sign-in, create a web OAuth client in Google Cloud
        Console and register this redirect URI:
      </p>
      <pre>
        <code>{`https://your-domain.com/api/auth/callback/google`}</code>
      </pre>
      <p>Then add the credentials to your environment:</p>
      <pre>
        <code>{`GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=`}</code>
      </pre>

      <h3>6. Build and start</h3>
      <p>Build the image and start all services:</p>
      <pre>
        <code>{`docker compose up --build`}</code>
      </pre>
      <p>
        When the container starts, it runs database migrations automatically and
        then starts the Next.js server. Locally, open{" "}
        <a href="http://localhost:3000">http://localhost:3000</a>. In
        production, point your reverse proxy at the app container on port{" "}
        <code>3000</code>.
      </p>

      <h2>Build-time environment variables</h2>
      <p>
        Most environment variables are read when the container starts. Variables
        prefixed with <code>NEXT_PUBLIC_</code> are different: Next.js embeds
        them into the browser bundle during{" "}
        <code>docker compose up --build</code>.
      </p>
      <p>The important self-hosting value is:</p>
      <pre>
        <code>{`NEXT_PUBLIC_DEPLOY_MODE=self-hosted`}</code>
      </pre>
      <p>
        If you change <code>NEXT_PUBLIC_DEPLOY_MODE</code> or{" "}
        <code>NEXT_PUBLIC_APP_URL</code>, rebuild the image. If you only change
        runtime values such as database, Redis, email, or storage credentials,
        restart the container.
      </p>
      <pre>
        <code>{`# Rebuild after NEXT_PUBLIC_* changes
docker compose up --build

# Restart after runtime-only environment changes
docker compose up -d`}</code>
      </pre>

      <h2>Service architecture</h2>
      <ul>
        <li>
          <strong>app</strong>: Navis Docs Next.js app, exposed on port{" "}
          <code>3000</code>
        </li>
        <li>
          <strong>db</strong>: Postgres with pgvector, persisted in the{" "}
          <code>db_data</code> Docker volume
        </li>
        <li>
          <strong>redis</strong>: Redis, persisted in the{" "}
          <code>redis_data</code> Docker volume
        </li>
      </ul>

      <h2>Upgrading</h2>
      <p>
        Pull the latest code, rebuild the image, and start the services again:
      </p>
      <pre>
        <code>{`git pull
docker compose pull
docker compose up --build`}</code>
      </pre>
      <p>
        Migrations run automatically before the app starts. Before major
        upgrades, back up your Postgres data, <code>.env</code> file, and object
        storage buckets.
      </p>

      <h2>Troubleshooting</h2>
      <h3>Check service status</h3>
      <pre>
        <code>{`docker compose ps`}</code>
      </pre>

      <h3>Follow app logs</h3>
      <pre>
        <code>{`docker compose logs -f app`}</code>
      </pre>

      <h3>App cannot connect to Postgres</h3>
      <p>
        Inside Docker Compose, use the service hostname <code>db</code>, not{" "}
        <code>localhost</code>:
      </p>
      <pre>
        <code>{`DATABASE_URL=postgresql://postgres:password@db:5432/navis_docs`}</code>
      </pre>

      <h3>OAuth redirect mismatch</h3>
      <p>
        Check that Google Cloud Console contains the exact redirect URI for your
        deployment:
      </p>
      <pre>
        <code>{`https://your-domain.com/api/auth/callback/google`}</code>
      </pre>

      <h3>Cloud-only UI still appears</h3>
      <p>
        Set <code>NEXT_PUBLIC_DEPLOY_MODE=self-hosted</code> and rebuild the
        image with <code>docker compose up --build</code>.
      </p>
    </>
  );
}
