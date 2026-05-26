![Navis Docs hero](public/readme-images/hero-image.webp)

<div align="center">
  <h3 align="center">Navis Docs</h3>
  <p>The open source platform for knowledge and SOP management</p>
</div>

<p align="center">
  <a href="https://github.com/navis-docs/navis-docs/projects?query=is%3Aopen">Roadmap</a>
  ·
  <a href="https://navisdocs.com">Website</a>
  ·
  <a href="https://navisdocs.com/docs">Docs</a>
  ·
  <a href="https://discord.gg/c7Tj9x3a">Discord</a>
</p>

<div align="center">
  <a href="https://www.gnu.org/licenses/agpl-3.0.html"><img alt="License" src="https://img.shields.io/badge/license-AGPLv3-purple"></a>
  <a href="https://github.com/navis-docs/navis-docs/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/navis-docs/navis-docs/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://discord.gg/c7Tj9x3a"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join%20us-5865F2?style=flat&logo=discord&logoColor=white"></a>
</div>

## Features 💫

- 🧭 **Organizational Knowledge Base**: Structure SOPs by organization, department, team, category, and process.
- ✍️ **Four Documentation Formats**: Create rich text procedures, sequential steps, visual flowcharts, and decision trees.
- 🤖 **AI Search**: Ask questions in plain English and receive answers sourced from published documentation.
- 🔐 **Role-Based Access**: Give owners, admins, and members the right level of access across each organization.
- 🧾 **Audit Trails**: Track who changed what and when for compliance, reviews, and operational accountability.
- 📌 **Favorites**: Pin the procedures your team uses most often.
- 🚨 **Error Reporting**: Flag outdated or incorrect procedures directly from the page.
- 💡 **Idea Pipeline**: Capture improvements from the people who use procedures every day.
- 📣 **Announcements**: Share targeted updates with specific departments and teams.

See our [roadmap](https://github.com/navis-docs/navis-docs/projects?query=is%3Aopen) for upcoming features.

## Screenshot 👁️

<img width="1507" alt="Navis Docs application screenshot" src="public/readme-images/screenshot.webp" />

## Made With 🛠️

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL + pgvector](https://github.com/pgvector/pgvector)
- [Auth.js](https://authjs.dev/)
- [TipTap](https://tiptap.dev/)
- [React Flow](https://reactflow.dev/)
- [Anthropic](https://www.anthropic.com/) and [OpenAI](https://openai.com/) SDKs
- [Resend](https://resend.com/)

## Self Hosting 🐳

The easiest way to self-host Navis Docs is with Docker Compose. The included Compose file builds the app and starts Postgres with `pgvector` plus Redis.

1. Clone the repository:

```bash
git clone https://github.com/navis-docs/navis-docs.git
cd navis-docs
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Configure the required values in `.env`:

```bash
NEXT_PUBLIC_APP_URL=https://docs.your-domain.com
NEXTAUTH_URL=https://docs.your-domain.com
AUTH_SECRET=replace-with-generated-value
AI_KEY_ENCRYPTION_SECRET=replace-with-generated-value
DATABASE_URL=postgresql://postgres:password@db:5432/navis_docs
REDIS_URL=redis://redis:6379
RESEND_API_KEY=re_...
EMAIL_FROM=Navis Docs <no-reply@your-domain.com>
NEXT_PUBLIC_DEPLOY_MODE=self-hosted
```

Generate strong secrets with:

```bash
openssl rand -base64 32
```

4. Start the containers:

```bash
docker compose up --build
```

5. Access Navis Docs at [http://localhost:3000](http://localhost:3000).

The application will be running in the foreground. You can manage the containers with:

- To run in the background: `docker compose up --build -d`
- To stop the containers: `docker compose down`
- To view app logs: `docker compose logs -f app`
- To rebuild after changing `NEXT_PUBLIC_*` values: `docker compose up --build`

For the complete self-hosting guide, see [SELF_HOSTING.md](./SELF_HOSTING.md).

> **Note**: Navis Docs requires object storage for procedure images, imports, and audit exports. Configure either S3-compatible storage or Supabase Storage in `.env` before running a production deployment.

## Local Development 🧑‍💻

1. Fork or clone the repository:

```bash
git clone https://github.com/navis-docs/navis-docs.git
cd navis-docs
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env` and configure your local values:

```bash
cp .env.example .env
```

4. Start local infrastructure:

```bash
docker compose up -d db redis
```

5. Run database migrations:

```bash
pnpm migrate
```

6. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

Useful development commands:

- `pnpm typecheck` - run TypeScript checks
- `pnpm test` - run unit tests
- `pnpm build` - create a production build
- `pnpm db:studio` - open Prisma Studio
- `pnpm format` - format the codebase with Prettier

## Environment Variables 🔐

| Variable                             | Description                                                                      | Required             | Example                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                       | PostgreSQL connection string. pgvector is required.                              | Yes                  | `postgresql://postgres:password@localhost:5432/navis_docs`            |
| `DIRECT_URL`                         | Direct PostgreSQL URL for Prisma migrations when using a pooler.                 | Sometimes            | `postgresql://postgres:password@db.example.supabase.co:5432/postgres` |
| `STORAGE_PROVIDER`                   | Object storage provider. Use `s3` or `supabase`.                                 | Yes                  | `s3`                                                                  |
| `S3_ENDPOINT`                        | S3-compatible endpoint. Leave blank for AWS S3.                                  | For S3               | `https://account.r2.cloudflarestorage.com`                            |
| `S3_REGION`                          | S3 region.                                                                       | For S3               | `auto`                                                                |
| `S3_ACCESS_KEY_ID`                   | S3 access key ID.                                                                | For S3               | `AKIA...`                                                             |
| `S3_SECRET_ACCESS_KEY`               | S3 secret access key.                                                            | For S3               | `...`                                                                 |
| `S3_PROCEDURE_IMAGES_BUCKET`         | Bucket for procedure images.                                                     | For S3               | `procedure-images`                                                    |
| `S3_PROCEDURE_IMPORTS_BUCKET`        | Bucket for procedure imports.                                                    | For S3               | `procedure-imports`                                                   |
| `S3_PROCEDURE_AUDITS_BUCKET`         | Bucket for audit exports.                                                        | For S3               | `audit-exports`                                                       |
| `SUPABASE_URL`                       | Supabase project URL for Supabase Storage.                                       | For Supabase Storage | `https://project.supabase.co`                                         |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase service role key for server-side storage access.                        | For Supabase Storage | `eyJ...`                                                              |
| `REDIS_URL`                          | Redis connection string.                                                         | Yes                  | `redis://localhost:6379`                                              |
| `AUTH_SECRET`                        | Auth.js secret used to sign sessions.                                            | Yes                  | Random 32+ character string                                           |
| `NEXTAUTH_URL`                       | Canonical Auth.js URL for callbacks and emails.                                  | Yes                  | `http://localhost:3000`                                               |
| `GOOGLE_CLIENT_ID`                   | Google OAuth client ID.                                                          | Optional             | `xxx.apps.googleusercontent.com`                                      |
| `GOOGLE_CLIENT_SECRET`               | Google OAuth client secret.                                                      | Optional             | `xxx`                                                                 |
| `RESEND_API_KEY`                     | Resend API key for OTP, invites, and transactional email.                        | Yes for email        | `re_...`                                                              |
| `EMAIL_FROM`                         | Sender email address.                                                            | Yes for email        | `Navis Docs <no-reply@your-domain.com>`                               |
| `ANTHROPIC_API_KEY`                  | Anthropic API key for AI chat responses.                                         | Optional             | `sk-ant-...`                                                          |
| `OPENAI_API_KEY`                     | OpenAI API key for embeddings.                                                   | Optional             | `sk-...`                                                              |
| `AI_KEY_ENCRYPTION_SECRET`           | Secret used to encrypt organization-provided AI keys.                            | Yes                  | Random 32+ character string                                           |
| `STRIPE_SECRET_KEY`                  | Stripe secret key for billing.                                                   | Yes (cloud)          | `sk_test_...`                                                         |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret.                                                   | Yes (cloud)          | `whsec_...`                                                           |
| `STRIPE_DEFAULT_PRICE_ID`            | Default Stripe price ID used when creating org trials at signup.                   | Yes (cloud)          | `price_...`                                                           |
| `NEXT_PUBLIC_APP_URL`                | Public app URL for links, metadata, and return URLs.                             | Yes                  | `https://navisdocs.com`                                               |
| `NEXT_PUBLIC_DEPLOY_MODE`            | Build-time deployment mode. Use `cloud` or `self-hosted`.                        | Yes                  | `self-hosted`                                                         |
| `NEXT_PUBLIC_DEMO_URL`               | Production only: demo base URL for the marketing iframe (`/dashboard` appended). | Optional             | `https://demo.navisdocs.com`                                          |

See [.env.example](./.env.example) for the complete list of supported environment variables and comments.

## Contributing 🤝

We welcome contributions! Please read our [contribution guidelines](CONTRIBUTING.md) before submitting a pull request.

## Contributors 👥

<a href="https://github.com/navis-docs/navis-docs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=navis-docs/navis-docs" />
</a>

## License 📝

Navis Docs is licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## Contact 📧

For support or to get in touch, join the [Navis Docs Discord](https://discord.gg/c7Tj9x3a) or email [hello@navisdocs.com](mailto:hello@navisdocs.com).
