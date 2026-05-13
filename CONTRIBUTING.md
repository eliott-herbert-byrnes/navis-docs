# Contributing to Navis Docs

Thank you for your interest in contributing to Navis Docs! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/navis-docs.git`
3. Create a new branch: `git checkout -b feat/your-feature-name`
4. Install dependencies: `pnpm install`
5. Copy `.env.example` to `.env` and configure your environment variables.
6. Start local services: `docker compose up -d db redis`
7. Run database migrations: `pnpm migrate`
8. Start the development server: `pnpm dev`
9. Make your changes.
10. Run the relevant checks.
11. Commit your changes: `git commit -m "feat: description of changes"`
12. Push to your fork: `git push origin feat/your-feature-name`
13. Open a Pull Request.

## Development Guidelines

### Code Style

- Follow the existing code style and project structure.
- Use TypeScript for application code.
- Prefer existing components, utilities, and patterns before adding new abstractions.
- Use meaningful variable, function, and component names.
- Add comments only for complex logic that is not self-explanatory.
- Keep changes focused and avoid unrelated refactors in the same pull request.

### UI Changes

- Keep interfaces accessible and keyboard-friendly.
- Use existing design tokens, Radix primitives, and shared UI components where possible.
- Include screenshots or short screen recordings in your pull request for visible UI changes.
- Check responsive behavior for mobile and desktop layouts.

### Database Changes

- Use Prisma migrations for schema changes.
- Keep migrations focused and review generated SQL before opening a pull request.
- Consider how changes affect existing self-hosted installations.
- Document any new required environment variables in `.env.example` and `README.md`.

### AI, Storage, and Billing Changes

- Never commit API keys, service role keys, Stripe secrets, or generated `.env` files.
- Make AI features degrade gracefully when optional API keys are not configured.
- Add or update tests for behavior that touches permissions, billing, audit logs, imports, exports, or AI responses.

## Local Checks

Before opening a pull request, run the checks that match your change:

```bash
pnpm typecheck
pnpm test
pnpm build
```

For formatting changes, run:

```bash
pnpm format
```

If your change touches the database, also verify Prisma generation and migrations:

```bash
pnpm prisma generate
pnpm migrate
```

## Commits

- Use clear and descriptive commit messages.
- Prefer conventional prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:`.
- Reference issue numbers when applicable.
- Keep commits focused on a single logical change.

## Pull Requests

- Provide a clear description of the problem and solution.
- Link related issues, discussions, or roadmap items.
- Include screenshots for UI changes.
- Mention any new environment variables, migrations, or deployment steps.
- Keep PRs focused on a single feature, fix, or documentation improvement.
- Be responsive to review feedback and keep discussion constructive.

## Need Help?

- Check existing issues and pull requests before starting larger work.
- Review [SELF_HOSTING.md](SELF_HOSTING.md) for Docker and deployment details.
- Email [hello@navisdocs.com](mailto:hello@navisdocs.com) for major concerns.
- Join the [Navis Docs Discord](https://discord.gg/c7Tj9x3a) for community discussion.

## Code of Conduct

We aim to foster an inclusive and welcoming community. Harassment, abusive behavior, and discrimination will not be tolerated.

By participating in this project, you agree to communicate respectfully, assume good intent, and help keep Navis Docs a constructive place for contributors and users.

## License

By contributing to Navis Docs, you agree that your contributions will be licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).
