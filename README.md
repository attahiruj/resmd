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
- An [OpenRouter](https://openrouter.ai) API key (optional — required for AI features)

### Quick Start (No Supabase Required)

You can run resmd locally without a Supabase account using the built-in SQLite provider:

```bash
git clone https://github.com/attahiruj/resmd.git
cd resmd
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
DB_PROVIDER=local
NEXT_PUBLIC_DB_PROVIDER=local
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional — for AI features:
OPENROUTER_API_KEY=your_openrouter_api_key
```

```bash
npm run dev
```

The SQLite database is auto-created at `./data/local.db`. Register with email + password at `/auth`. Note: OAuth (Google) is not available in local mode.

### Setup with Supabase

For full production features (OAuth, anonymous sessions, cloud sync):

```env
DB_PROVIDER=supabase
NEXT_PUBLIC_DB_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_api_key
```

Run the SQL schema from [`ai.md`](ai.md) in your Supabase SQL editor to create the required tables and RLS policies.

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

## MCP Server

resmd exposes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server so AI agents and automation tools (Claude Desktop, n8n, Make) can programmatically create, edit, tailor, and export resumes.

### Generate an MCP Key

1. Open the dashboard and click your **user menu** (bottom-left)
2. Select **MCP Keys**
3. Enter a name for the key and click **Generate**
4. Copy the key immediately — it is only shown once

Use it as a Bearer token for all API calls:

```
Authorization: Bearer <your-mcp-key>
```

### Claude Code

Clone and build the [resmd-mcp](https://github.com/attahiruj/resmd-mcp) server, then register it with Claude Code:

```bash
# Against the hosted app
claude mcp add resmd \
  --env RESMD_API_URL=https://resmd.app \
  --env RESMD_MCP_KEY=<your-mcp-key> \
  -- node /path/to/resmd-mcp/dist/server.js

# Against a local instance
claude mcp add resmd \
  --env RESMD_API_URL=http://localhost:3000 \
  --env RESMD_MCP_KEY=<your-mcp-key> \
  -- node /path/to/resmd-mcp/dist/server.js
```

> Claude Desktop only supports cloud-hosted MCP servers. Use Claude Code for local MCP servers.

### Available Tools

| Tool               | Description                             |
| ------------------ | --------------------------------------- |
| `list_resumes`     | List all resumes                        |
| `get_resume`       | Fetch a resume with full content        |
| `create_resume`    | Create a new resume                     |
| `update_resume`    | Update content, title, or template      |
| `delete_resume`    | Delete a resume                         |
| `clone_resume`     | Clone with a new title                  |
| `tailor_resume`    | Clone + AI-tailor for a job description |
| `chat_with_resume` | Chat with AI about a resume             |
| `enhance_text`     | AI-rewrite a piece of resume text       |
| `import_resume`    | Import PDF/DOCX/TXT → resmarkup         |
| `export_pdf`       | Export resume as base64 PDF             |
| `list_templates`   | List available templates                |

See the [resmd-mcp](https://github.com/attahiruj/resmd-mcp) repo for full setup and n8n/Make integration details.

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
