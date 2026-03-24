# Resmd

Open Source AI-Powered Resume Builder

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![Stars](https://img.shields.io/github/stars/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/stargazers)
[![Forks](https://img.shields.io/github/forks/attahiruj/resmd?style=flat)](https://github.com/attahiruj/resmd/network/members)
[![Contributors](https://img.shields.io/github/contributors/attahiruj/resmd)](https://github.com/attahiruj/resmd/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/attahiruj/resmd)](https://github.com/attahiruj/resmd/issues)

[Live App](https://resmd.app/) · [Documentation](https://github.com/attahiruj/resmd/wiki) · [Contributing](CONTRIBUTING.md)

---

Resmd replaces rigid form-based editors with **ResMarkup** — a lightweight plain-text syntax. Write your resume like a document, get live preview, AI feedback, and export a polished PDF. Your content stays in plain text and is never locked to a proprietary format.

---

## Features

| Feature              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| **ResMarkup Syntax** | `# Section`, `## Entry`, `Key: Value`, bullet points |
| **Live Preview**     | Side-by-side editor and rendered template            |
| **AI Enhance**       | Select text for AI-powered rewrites                  |
| **AI Chat**          | Conversational assistant for resume advice           |
| **AI Review**        | Structured feedback on content quality               |
| **AI Match**         | Compare resume against job descriptions              |
| **Templates**        | Minimal, Modern, Technical, Executive, Creative      |
| **PDF Export**       | Print-ready PDF with template fidelity               |
| **Clonning**         | Clone existing resumes to create variants            |
| **Public Sharing**   | Publish at shareable `/r/[slug]` URLs                |

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | [Next.js](https://nextjs.org) (App Router, SSR) |
| Language        | TypeScript                                      |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL)   |
| Styling         | [Tailwind CSS](https://tailwindcss.com)         |
| Code Editor     | [CodeMirror 6](https://codemirror.net)          |
| AI              | [OpenRouter](https://openrouter.ai)             |
| PDF             | [@react-pdf/renderer](https://react-pdf.com)    |
| Icons           | [Phosphor Icons](https://phosphoricons.com)     |

---

## Local Development

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

Configure `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the SQL schema from [`ai.md`](ai.md) in your Supabase SQL editor to create the required tables and RLS policies.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `npm run dev`    | Start development server  |
| `npm run build`  | Create production build   |
| `npm run start`  | Run production server     |
| `npm run lint`   | Run ESLint                |
| `npm run format` | Format code with Prettier |

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on:

- Reporting bugs and requesting features
- Setting up your local development environment
- Submitting pull requests
- Code style and commit conventions

---

## License

[AGPL-3.0](LICENSE) — see the LICENSE file for details.
