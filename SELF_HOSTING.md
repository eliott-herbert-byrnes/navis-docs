# Self-Hosting Navis Docs

This guide explains how to run Navis Docs with Docker Compose. The bundled
Compose file starts:

- `app`: the Next.js application on port `3000`
- `db`: Postgres with the `pgvector` extension
- `redis`: Redis for shared rate limiting and Redis-backed app features

Persistent data is stored in Docker volumes named `db_data` and `redis_data`.

## Prerequisites

- Docker Engine with Docker Compose
- Docker BuildKit, enabled by default in Docker 23 and newer
- Object storage credentials, either Supabase Storage or S3-compatible storage
- Resend credentials for email sign-in, invites, and transactional email
- Google OAuth credentials if you want Google sign-in

## 1. Clone the Repository

```bash
git clone https://github.com/eliott-herbert-byrnes/navis-docs.git
cd navis-docs
```

## 2. Create Your Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` for your deployment. At minimum, set these values:

```bash
# Public URL for links, OAuth redirects, and build-time client config
NEXT_PUBLIC_APP_URL=https://docs.your-domain.com
NEXTAUTH_URL=https://docs.your-domain.com

# Required secrets
AUTH_SECRET=replace-with-generated-value
AI_KEY_ENCRYPTION_SECRET=replace-with-generated-value

# Docker Compose service URLs
DATABASE_URL=postgresql://postgres:password@db:5432/navis_docs
REDIS_URL=redis://redis:6379

# Required for email sign-in and invitations
RESEND_API_KEY=re_...
EMAIL_FROM=Navis Docs <no-reply@your-domain.com>

# Build-time deploy mode
NEXT_PUBLIC_DEPLOY_MODE=self-hosted
```

Generate strong secrets with:

```bash
openssl rand -base64 32
```

Use a different generated value for `AUTH_SECRET` and
`AI_KEY_ENCRYPTION_SECRET`.

> [!WARNING]
> Keep `AI_KEY_ENCRYPTION_SECRET` stable and backed up. Navis Docs uses it to
> encrypt organization-provided AI API keys in the database. If this value
> changes, existing encrypted API keys become permanently unreadable.

## 3. Choose a Storage Provider

Navis Docs stores procedure images, procedure imports, and audit exports in
object storage. Choose one provider.

### S3-Compatible Storage

Use this option for AWS S3, Cloudflare R2, Garage, MinIO, and similar services.

```bash
STORAGE_PROVIDER=s3
S3_ENDPOINT=              # leave blank for AWS S3; set for R2, Garage, MinIO
S3_REGION=auto            # use your AWS region for AWS S3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PROCEDURE_IMAGES_BUCKET=procedure-images
S3_PROCEDURE_IMPORTS_BUCKET=procedure-imports
S3_PROCEDURE_AUDITS_BUCKET=audit-exports
```

For many MinIO and Garage deployments, also set:

```bash
S3_FORCE_PATH_STYLE=true
```

Create the three buckets before starting the app, or grant credentials enough
permission for your storage provider to create and manage them.

### Supabase Storage

Use this option if you already run Supabase or want to keep object storage in a
Supabase project:

```bash
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Create these Supabase Storage buckets:

- `procedure-images`
- `procedure-imports`
- `audit-exports`

## 4. Configure Google OAuth

Google sign-in uses Auth.js at this redirect URI:

```text
https://your-domain.com/api/auth/callback/google
```

To create credentials:

1. Open the Google Cloud Console.
2. Create or choose a project.
3. Configure the OAuth consent screen.
4. Go to **APIs & Services** -> **Credentials**.
5. Create an **OAuth client ID** for a web application.
6. Add your production redirect URI:
  `https://your-domain.com/api/auth/callback/google`.
7. For local development, optionally add:
  `http://localhost:3000/api/auth/callback/google`.
8. Copy the client ID and client secret into `.env`:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 5. Build and Start

Run:

```bash
docker compose up --build
```

The app will be available at:

```text
http://localhost:3000
```

For a server deployment, put a reverse proxy such as Nginx, Caddy, Traefik, or
your platform proxy in front of the app container and proxy traffic to port
`3000`.

## Build-Time vs Runtime Environment Variables

Most variables are read at runtime from `.env`, but variables prefixed with
`NEXT_PUBLIC_` are compiled into the Next.js client bundle at build time.

The important gotcha is:

```bash
NEXT_PUBLIC_DEPLOY_MODE=self-hosted
```

The Compose file passes this as a Docker build argument. If you change
`NEXT_PUBLIC_DEPLOY_MODE` or `NEXT_PUBLIC_APP_URL`, rebuild the image:

```bash
docker compose up --build
```

Changing only runtime values such as `DATABASE_URL`, `REDIS_URL`,
`RESEND_API_KEY`, or storage credentials does not require a rebuild. Restart the
container instead:

```bash
docker compose up -d
```

## Database Migrations

The app container runs:

```bash
prisma migrate deploy
```

before starting the Next.js server. This happens automatically through
`entrypoint.sh` whenever the container starts.

## Upgrading

Pull the latest code, rebuild, and start the services:

```bash
git pull
docker compose pull
docker compose up --build
```

Database migrations run automatically before the app starts.

Before major upgrades, back up:

- The Postgres volume or database
- Your `.env` file
- Your object storage buckets

## Useful Commands

Check service status:

```bash
docker compose ps
```

Follow logs:

```bash
docker compose logs -f app
```

Stop services:

```bash
docker compose down
```

Stop services and remove local volumes:

```bash
docker compose down -v
```

Only use `docker compose down -v` when you intentionally want to delete the
bundled Postgres and Redis data.

## Troubleshooting

### The App Cannot Connect to Postgres

When using the bundled Compose database, `DATABASE_URL` must point to the
Compose service name:

```bash
DATABASE_URL=postgresql://postgres:password@db:5432/navis_docs
```

Do not use `localhost` from inside the app container. `localhost` would refer to
the app container itself, not the `db` service.

### The App Cannot Connect to Redis

When using the bundled Compose Redis service, set:

```bash
REDIS_URL=redis://redis:6379
```

### OAuth Redirect Mismatch

Confirm that Google Cloud Console includes the exact redirect URI for your
public app URL:

```text
https://your-domain.com/api/auth/callback/google
```

The scheme, host, and path must match exactly.

### Self-Hosted UI Still Looks Like Cloud Mode

`NEXT_PUBLIC_DEPLOY_MODE` is a build-time variable. Set:

```bash
NEXT_PUBLIC_DEPLOY_MODE=self-hosted
```

then rebuild:

```bash
docker compose up --build
```

### Stored AI Keys No Longer Decrypt

Restore the original `AI_KEY_ENCRYPTION_SECRET` from backup. If the original
value is lost, previously encrypted organization AI keys cannot be recovered and
must be re-entered.