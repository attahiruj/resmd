# Resmd

Open Source AI-Powered Resume Builder

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Stars](https://img.shields.io/github/stars/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/stargazers)
[![Forks](https://img.shields.io/github/forks/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/network/members)
[![Contributors](https://img.shields.io/github/contributors/attahiruj/resmd)](https://github.com/attahiruj/resmd/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/attahiruj/resmd)](https://github.com/attahiruj/resmd/issues)

Write your resume in plain text. Get AI assistance. Export a beautiful PDF.

[Live App](https://resmd.app/) · [Report a Bug](https://github.com/attahiruj/resmd/issues/new?labels=bug) · [Request a Feature](https://github.com/attahiruj/resmd/issues/new?labels=enhancement)

---

Resmd replaces rigid form-based editors with **ResMarkup** — a lightweight plain-text syntax. Write your resume like a document, get live preview, AI feedback, and export a polished PDF. Your content stays in plain text and is never locked to a proprietary format.

---

## Features

| Feature               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| **ResMarkup Syntax**  | `# Section`, `## Entry`, `Key: Value`, bullet points — simple and flexible |
| **Live Preview**      | Side-by-side editor and rendered template, updates as you type             |
| **AI Enhance**        | Select any text for AI-powered rewrites and improvements                   |
| **AI Chat**           | Conversational assistant for resume advice and content ideas               |
| **AI Review**         | Structured feedback on content quality and impact                          |
| **AI Match**          | Compare your resume against a job description                              |
| **Templates**         | Minimal, Modern, Technical, Executive, Creative                            |
| **PDF Export**        | Print-ready PDF with template fidelity                                     |
| **Version Snapshots** | Track changes and restore previous versions                                |
| **Public Sharing**    | Publish a resume at a shareable `/r/[slug]` URL                            |
| **Multiple Variants** | Manage different resume versions per account                               |

---

## Tech Stack

| Layer           | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | [Next.js](https://nextjs.org) (App Router, SSR)      |
| Language        | TypeScript                                           |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL)        |
| Styling         | [Tailwind CSS](https://tailwindcss.com)              |
| Code Editor     | [CodeMirror 6](https://codemirror.net)               |
| AI              | [OpenRouter](https://openrouter.ai) (model-agnostic) |
| PDF             | [@react-pdf/renderer](https://react-pdf.com)         |
| Icons           | [Phosphor Icons](https://phosphoricons.com)          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenRouter](https://openrouter.ai) API key (free tier works)

### Setup

```bash
git clone https://github.com/attahiruj/resmd.git
cd resmd
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENROUTER_API_KEY=your_openrouter_api_key
# OPENROUTER_MODEL=google/gemma-3n-e4b-it:free  # optional override

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the SQL schema from [`ai.md`](ai.md) in your Supabase SQL editor to create the required tables and RLS policies.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
npm run format    # Prettier
```

---

## Contributing

Contributions are welcome. Before starting significant work, [open an issue](https://github.com/attahiruj/resmd/issues/new) to discuss it first.

- Look for [`good first issue`](https://github.com/attahiruj/resmd/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) tags for entry points
- One PR per concern — keep changes focused
- Run `npm run lint` and `npm run build` before submitting
- Use [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, etc.)
- For UI changes, include a screenshot or recording in the PR description

To [report a bug](https://github.com/attahiruj/resmd/issues/new?labels=bug), include steps to reproduce, expected vs. actual behavior, and any relevant console errors.

---

## License

AGPL-3.0 — see [LICENSE](LICENSE).
