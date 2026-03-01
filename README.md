# Resmd

Open Source AI-Powered Resume Builder

[![License: AGPL-3.0](https://img.shields.io/github/license/attahiruj/resmd)](LICENSE)
[![Stars](https://img.shields.io/github/stars/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/stargazers)
[![Forks](https://img.shields.io/github/forks/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/network/members)
[![Contributors](https://img.shields.io/github/contributors/attahiruj/resmd)](https://github.com/attahiruj/resmd/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/attahiruj/resmd)](https://github.com/attahiruj/resmd/issues)

Write your resume in plain text. Get AI assistance. Export a beautiful PDF.

[Demo](https://github.com/attahiruj/resmd) · [Report a Bug](https://github.com/attahiruj/resmd/issues/new?labels=bug) · [Request a Feature](https://github.com/attahiruj/resmd/issues/new?labels=enhancement)

---

## Overview

Resmd is a resume builder that replaces rigid form-based editors with **ResMarkup** — a lightweight plain-text syntax. Write your resume like a document, see a live preview, get AI feedback, and export a polished PDF.

Core ideas:

- Plain text is portable. Your resume content isn't locked in a proprietary format.
- AI assistance should be contextual, not generic. Enhance specific text, chat about your resume, match against job descriptions.
- Templates should be swappable without touching the content.

---

## Features

| Feature | Description |
| --- | --- |
| **ResMarkup Syntax** | `# Section`, `## Entry`, `Key: Value`, bullet points — simple and flexible |
| **Live Preview** | Side-by-side editor and rendered template, updates as you type |
| **AI Enhance** | Select any text for AI-powered rewrites and improvements |
| **AI Chat** | Conversational assistant for resume advice and content ideas |
| **AI Review** | Structured feedback on content quality and impact |
| **AI Match** | Compare your resume against a job description |
| **Templates** | Minimal, Modern, Technical, Executive, Creative |
| **PDF Export** | Print-ready PDF with template fidelity |
| **Version Snapshots** | Track changes, restore previous versions |
| **Public Sharing** | Publish a resume at a shareable `/r/[slug]` URL |
| **Multiple Variants** | Manage different resume versions per user |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router, SSR) |
| Language | TypeScript |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Code Editor | [CodeMirror 6](https://codemirror.net) |
| AI | [OpenRouter](https://openrouter.ai) (model-agnostic) |
| PDF | [@react-pdf/renderer](https://react-pdf.com) |
| Icons | [Phosphor Icons](https://phosphoricons.com) |

---

## Architecture

```text
resmd/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── ai/                 # AI endpoints: /enhance /chat /review /match
│   │   ├── export/             # PDF generation endpoint
│   │   └── variants/           # Resume CRUD: create, update, delete, publish
│   ├── auth/                   # Sign in / sign up
│   ├── dashboard/              # User's resume list and management
│   ├── editor/                 # Main editor view (editor + live preview)
│   ├── r/[slug]/               # Public resume page
│   ├── pricing/                # Pricing page
│   └── templates/              # Template showcase
│
├── components/
│   ├── editor/                 # CodeMirror editor, toolbar, AI panel, snapshot list
│   ├── preview/                # Live template renderer, settings panel
│   ├── templates/              # Resume templates (screen rendering)
│   │   └── pdf/                # PDF-specific template versions
│   ├── dashboard/              # Dashboard UI (resume cards, create modal)
│   ├── variants/               # Clone and fork modal
│   └── ui/                     # Base components: Button, Modal, Navbar, etc.
│
├── lib/
│   ├── parser.ts               # ResMarkup → ParsedResume object
│   ├── templates.ts            # Template registry and lazy loading
│   ├── themes.ts               # Theme system (dark/light + CSS variables)
│   ├── ai.ts                   # Client-side AI request helpers
│   ├── prompts.ts              # AI prompt templates and model config
│   ├── inline.ts               # Inline text enhancement logic
│   ├── renderInline.tsx        # Inline formatting for web (bold, italic, links)
│   ├── renderInlinePdf.tsx     # Inline formatting for PDF
│   ├── variantService.ts       # Supabase database operations
│   ├── rateLimit.ts            # API rate limiting
│   ├── limits.ts               # Feature limits per plan
│   ├── supabase.ts             # Supabase browser client
│   ├── supabase-server.ts      # Supabase server client
│   └── env.ts                  # Environment variable validation
│
├── hooks/
│   ├── useVariant.ts           # Resume variant state and operations
│   └── useProfile.ts           # User profile and plan state
│
└── types/
    └── resume.ts               # Core types: ParsedResume, ResumeVariant, etc.
```

### Data Flow

```text
User types ResMarkup
        │
        ▼
  lib/parser.ts          Parses text → ParsedResume (structured object)
        │
        ▼
  components/templates/  Renders ParsedResume → HTML (preview) or PDF
        │
        ▼
  app/api/variants/      Persists content to Supabase (resume_variants table)
```

### AI Pipeline

```text
User selects text / opens chat
        │
        ▼
  lib/ai.ts              Client builds request with resume context
        │
        ▼
  app/api/ai/[action]/   Server-side handler validates, applies rate limits
        │
        ▼
  OpenRouter API          Routes to configured model (Gemma, Claude, etc.)
        │
        ▼
  Streamed response back to editor
```

### Database Schema

```sql
-- User profiles with plan tracking
profiles (
  id uuid PRIMARY KEY,          -- matches auth.users.id
  email text,
  ai_uses_today int,
  last_ai_reset date,
  is_pro boolean,
  stripe_customer_id text,
  subscription_expires_at timestamptz
)

-- Resume content and metadata
resume_variants (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles,
  title text,
  content text,                 -- ResMarkup source
  template text,                -- template identifier
  is_published boolean,
  public_slug text UNIQUE,
  created_at timestamptz,
  updated_at timestamptz
)

-- Version history for recovery
variant_snapshots (
  id uuid PRIMARY KEY,
  variant_id uuid REFERENCES resume_variants,
  content text,
  created_at timestamptz
)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenRouter](https://openrouter.ai) API key (free tier works)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/attahiruj/resmd.git
cd resmd
```

#### 2. Install dependencies

```bash
npm install
# or: yarn / pnpm / bun
```

#### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter — get a free key at https://openrouter.ai
OPENROUTER_API_KEY=your_openrouter_api_key
# Optional: override the default model
# OPENROUTER_MODEL=google/gemma-3n-e4b-it:free

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Set up the database

Run the SQL schema from [`ai.md`](ai.md) in your Supabase SQL editor. This creates the `profiles`, `resume_variants`, and `variant_snapshots` tables with the correct RLS policies.

#### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run format    # Format with Prettier
```

---

## Contributing

Contributions are welcome. Before starting work on a significant change, please [open an issue](https://github.com/attahiruj/resmd/issues/new) to discuss it first.

### Good First Issues

Look for issues tagged [`good first issue`](https://github.com/attahiruj/resmd/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — these are scoped and well-described entry points.

### Contribution Workflow

#### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/resmd.git
cd resmd
```

#### 2. Create a branch

Use a descriptive branch name:

```bash
git checkout -b feat/add-template-preview
git checkout -b fix/parser-edge-case
git checkout -b docs/update-setup-guide
```

Branch prefixes:

- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation only
- `refactor/` — code change with no behavior change
- `chore/` — tooling, dependencies, config

#### 3. Make your changes

- Keep changes focused. One PR per concern.
- Follow existing code style (enforced by ESLint + Prettier).
- Don't add unrelated cleanups or refactors to a feature PR.

#### 4. Check your work

```bash
npm run lint      # Must pass with no errors
npm run build     # Must build successfully
```

#### 5. Commit

Write commit messages in the imperative mood:

```text
feat: add keyboard shortcut for AI enhance
fix: handle empty sections in parser
docs: add ResMarkup syntax reference
```

#### 6. Push and open a Pull Request

```bash
git push origin feat/your-branch-name
```

Open a PR against `main`. In the PR description:

- Summarize what changed and why
- Link the related issue (`Closes #123`)
- Include a screenshot or recording for UI changes

### Code Style

- **TypeScript**: Strict mode. Avoid `any`.
- **Components**: Functional components with explicit props types.
- **Formatting**: Prettier handles it — run `npm run format` before committing.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components and types.
- **Imports**: Use `@/` path aliases (e.g., `@/lib/parser`, `@/components/ui/Button`).
- **Comments**: Only where the logic isn't self-evident. Prefer readable code over comments.

### Adding a Template

Templates live in [components/templates/](components/templates/). Each template:

1. Accepts a `ParsedResume` prop (see [types/resume.ts](types/resume.ts))
2. Has a web version and a matching PDF version in `components/templates/pdf/`
3. Is registered in [lib/templates.ts](lib/templates.ts)

Look at `Minimal.tsx` as the simplest reference implementation.

### Adding an AI Feature

AI endpoints live in `app/api/ai/`. Each route:

1. Validates the request and user session server-side
2. Checks rate limits via `lib/rateLimit.ts`
3. Builds a prompt using helpers from `lib/prompts.ts`
4. Streams the OpenRouter response back to the client

Client-side helpers in `lib/ai.ts` handle the fetch and streaming.

### Reporting Bugs

[Open an issue](https://github.com/attahiruj/resmd/issues/new?labels=bug) and include:

- Steps to reproduce
- Expected vs. actual behavior
- Browser / OS if it's a UI issue
- Any relevant console errors

---

## License

AGPL-3.0 — see [LICENSE](LICENSE).

---

## Acknowledgments

- [Next.js](https://nextjs.org) — the framework
- [Supabase](https://supabase.com) — open source database and auth
- [OpenRouter](https://openrouter.ai) — model-agnostic AI routing
- [Tailwind CSS](https://tailwindcss.com) — styling
- [CodeMirror](https://codemirror.net) — the editor engine
- Everyone who has opened an issue, submitted a PR, or shared the project
