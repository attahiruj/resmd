# Contributing to Resmd

Thank you for your interest in contributing to Resmd. This guide covers how to report bugs, suggest features, and contribute code.

---

## Code of Conduct

By participating in this project, you are expected to be respectful and constructive. We do not tolerate harassment, discrimination, or offensive behavior. If you experience or witness violations, please report them to the maintainers.

---

## Reporting Issues

### Bug Reports

Use the [Bug Report](https://github.com/attahiruj/resmd/issues/new?labels=bug) template. Include:

- **Clear description** of the issue
- **Steps to reproduce** the bug
- **Expected vs actual behavior**
- **Screenshots or recordings** if applicable
- **Environment details** (OS, browser, version)
- **Console errors** or relevant logs

### Feature Requests

Use the [Feature Request](https://github.com/attahiruj/resmd/issues/new?labels=enhancement) template. Include:

- **Problem or use case** — what issue does this solve?
- **Proposed solution** — describe the feature
- **Alternatives considered** — any other approaches you've thought of
- **Additional context** — mockups, examples, or references

### General Questions

For questions about usage or unclear issues, start a [Discussion](https://github.com/attahiruj/resmd/discussions/) instead of opening an issue.

---

## Suggesting Features

Before submitting a feature request:

1. **Search existing issues** — your idea may already be proposed
2. **Consider the scope** — is this within Resmd's goals?
3. **Be specific** — vague ideas are harder to evaluate

When ready, use the Feature Request template with a clear problem statement and proposed solution.

---

## Contributing Code

### Getting Started

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/resmd.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`

### Setting Up Your Local Environment

```bash
# Install dependencies
npm install

# Copy the example environment file
cp .env.local.example .env.local
```

Configure your `.env.local` with the required credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set up your Supabase database by running the SQL schema from [`ai.md`](ai.md) in your Supabase SQL editor.

```bash
# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify the setup.

### Finding Work

- Look for [`good first issue`](https://github.com/attahiruj/resmd/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) tags for beginner-friendly tasks
- Check open issues tagged with `help wanted` for tasks that need assistance
- Review the [project board](https://github.com/attahiruj/resmd/projects) for planned features

### Making Changes

1. **Discuss first** — for significant changes, open an issue before starting work
2. **One PR per concern** — keep changes focused and atomic
3. **Follow the code style** — the project uses ESLint and Prettier
4. **Write tests** if applicable — ensure your changes don't break existing functionality

### Before Submitting

Run these commands to validate your changes:

```bash
# Lint and check code style
npm run lint
npm run format:check

# Type check
npm run type-check

# Build the project
npm run build
```

All checks must pass before submitting a pull request.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org) format:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `style:` — code style changes (formatting, no logic)
- `refactor:` — code refactoring
- `test:` — adding or updating tests
- `chore:` — maintenance tasks

Examples:

```
feat: add dark mode toggle
fix: resolve PDF export crash on empty sections
docs: update installation instructions
```

### Submitting a Pull Request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a pull request against the `main` branch
3. Fill out the PR template with:
   - **Description** of what the change does
   - **Related issues** — link to any relevant issues
   - **Screenshots or recordings** for UI changes
   - **Testing steps** — how to verify the change works

### Review Process

- Maintainers will review your PR and provide feedback
- Address review comments by pushing additional commits
- Once approved, your PR will be merged

---

## Development Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start development server     |
| `npm run build`      | Create production build      |
| `npm run start`      | Run production server        |
| `npm run lint`       | Run ESLint                   |
| `npm run format`     | Format code with Prettier    |
| `npm run type-check` | Run TypeScript type checking |

---

## License

By contributing to Resmd, you agree that your contributions will be licensed under the [AGPL-3.0 License](LICENSE).
