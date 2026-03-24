# resmd — AI Agent Guide

This file guides AI agents in understanding the resmd project for code generation, bug fixes, and feature development.

## Project Overview

resmd is an AI-powered resume builder where users write resumes in ResMarkup (plain-text syntax) and see them rendered through swappable templates. Content stays in plain text; the platform handles presentation.

## Key Technologies

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (model-agnostic, supports multiple providers)
- **PDF**: @react-pdf/renderer
- **Editor**: CodeMirror 6

## Core Concepts

### ResMarkup Syntax

Plain-text resume format with flexible structure:

```resmd
# Section Title
## Entry Heading
Key: Value
- bullet point
plain text
```

### Parsing Model

The parser extracts structure without semantic interpretation:

- **ParsedResume**: sections[], meta, raw, settings
- **ResumeMeta**: name, email, title (extracted from Bio section)
- **ResumeSection**: id, title, hint (keyvalue/entries/list/text/mixed), items[]
- **SectionItem**: KeyValueItem, EntryItem, BulletItem, TextItem
- **ResumeSettings**: fontSize, lineHeight, marginH, marginV, entrySpacing

### Template System

Templates are decoupled renderers receiving ParsedResume:

- Follow standard rendering pattern: header → sections ordered by hint
- Create new template: add screen/pdf components + register in `/lib/templates.ts`
- Templates must handle all SectionItem types and never skip sections

**Available templates**: Minimal, Modern, Technical, Executive, Creative, more to be added

### Resume System

- **Resumes**: Primary entity stored in `resumes` table
- **Cloning**: Resumes can be cloned via `cloned_from_id` column
- Public sharing via `publicSlug` and `isPublic` fields
- Managed via `/lib/resumeService.ts`

### AI Features

- **Inline Enhancer**: rewrites selected text with AI-powered improvements
- **AI Chat**: conversational assistant providing resume advice
- **AI Review**: structured feedback on content quality
- **AI Match**: compare resume against job descriptions
- **Model Selection**: dynamic selection from available OpenRouter models

## Essential Files

| File                         | Purpose                                              |
| ---------------------------- | ---------------------------------------------------- |
| `/types/resume.ts`           | Canonical TypeScript types                           |
| `/lib/parser.ts`             | ResMarkup parsing logic                              |
| `/lib/templates.ts`          | Template registry + server-safe PDF component loader |
| `/lib/limits.ts`             | Usage limits (MAX_RESUMES, GUEST_RESUMES)            |
| `/lib/ai.ts`                 | Client-side streaming helpers (streamEnhance)        |
| `/lib/resumeService.ts`      | Resume CRUD operations                               |
| `/lib/supabase.ts`           | Client-side Supabase client                          |
| `/lib/supabase-server.ts`    | Server-side Supabase client                          |
| `/app/globals.css`           | Design tokens/CSS variables                          |
| `/tailwind.config.js`        | Semantic token mappings                              |
| `/components/templates/`     | Screen templates                                     |
| `/components/templates/pdf/` | PDF templates                                        |

## API Routes

| Endpoint                    | Purpose                             |
| --------------------------- | ----------------------------------- |
| `/api/ai/enhance`           | Inline text enhancement (streaming) |
| `/api/ai/chat`              | Conversational AI assistant         |
| `/api/ai/review`            | Resume quality analysis             |
| `/api/ai/match`             | Compare resume to job description   |
| `/api/ai/models`            | List available AI models            |
| `/api/ai/track`             | Track AI usage                      |
| `/api/resumes`              | List/create resumes                 |
| `/api/resumes/[id]`         | Get/update/delete resume            |
| `/api/resumes/[id]/clone`   | Clone a resume                      |
| `/api/resumes/[id]/publish` | Make resume public                  |
| `/api/export/pdf`           | Generate PDF export                 |

## Design System — Ink & Glow

### Theme Architecture

- **Default**: dark mode via CSS variables on `:root`; light mode opt-in via `.light` class on `<html>`
- **Source of truth**: `/app/globals.css` (CSS vars) + `/tailwind.config.js` (semantic token mappings)
- **Rule**: always use semantic Tailwind classes — never raw utilities like `bg-gray-800` or `text-white`

### Brand Colors

| Role                              | Tailwind class    | Dark value              | Light value             |
| --------------------------------- | ----------------- | ----------------------- | ----------------------- |
| **Primary accent — Citron Spark** | `accent`          | `#c8f135`               | `#7aa314`               |
| Accent hover                      | `accent-hover`    | `#d4f84e`               | `#6a8f10`               |
| Accent on colored bg              | `accent-text`     | `#0d0f14`               | `#ffffff`               |
| Accent muted bg                   | `accent-muted`    | `rgba(200,241,53,0.10)` | `rgba(122,163,20,0.10)` |
| **Secondary — Glacier Blue (AI)** | `secondary`       | `#4daaff`               | `#0073cc`               |
| Secondary hover                   | `secondary-hover` | `#69b8ff`               | `#005fa8`               |
| Secondary muted bg                | `secondary-muted` | `rgba(77,170,255,0.10)` | `rgba(0,115,204,0.08)`  |

> Use `accent` for primary CTAs and interactive highlights. Use `secondary` exclusively for AI-related UI moments.

### Surfaces & Text

| Token                  | Class                | Purpose                   |
| ---------------------- | -------------------- | ------------------------- |
| Page background        | `bg-bg`              | outermost background      |
| Card / panel           | `bg-surface`         | primary container         |
| Inset / input          | `bg-surface-2`       | inputs, nested areas      |
| Raised element         | `bg-surface-3`       | popovers, tooltips        |
| Overlay                | `bg-surface-overlay` | modal backdrops           |
| Primary text           | `text-text`          | body copy                 |
| Secondary text         | `text-muted`         | labels, captions          |
| Disabled / placeholder | `text-faint`         | placeholders              |
| On-accent text         | `text-accent-text`   | text on accent-colored bg |

### Borders

| Token      | Class                                 | Use                   |
| ---------- | ------------------------------------- | --------------------- |
| Default    | `border-border`                       | cards, dividers       |
| Strong     | `border-border-strong`                | emphasized separators |
| Focus ring | `border-border-focus` / `ring-accent` | keyboard focus states |

### Status Colors

| State          | Text class     | Background class |
| -------------- | -------------- | ---------------- |
| Success        | `text-success` | `bg-success-bg`  |
| Warning        | `text-warning` | `bg-warning-bg`  |
| Danger / error | `text-danger`  | `bg-danger-bg`   |
| Info           | `text-info`    | `bg-info-bg`     |

### Typography

| Role               | Class          | Font             |
| ------------------ | -------------- | ---------------- |
| Display / headings | `font-display` | Instrument Serif |
| UI / body          | `font-ui`      | DM Sans          |
| Code / editor      | `font-mono`    | Geist Mono       |

### Elevation & Shadows

`shadow-sm` → `shadow-md` → `shadow-lg` → `shadow-xl` (increasing depth)
`shadow-accent` / `shadow-accent-strong` — glow halos for featured elements

### Border Radius

`rounded-sm` (6px) → `rounded-md` (8px) → `rounded-lg` (12px) → `rounded-xl` (16px) → `rounded-2xl` (24px) → `rounded-full`

---

## Development Guidelines

1. **Type Safety**: `npm run type-check` must pass with zero errors; no `any` types
2. **Limits**: Always import limits from `/lib/limits.ts`; never hardcode values
3. **Error Handling**: Handle network, empty, auth states; parser never throws
4. **Mobile**: Check layout at 375px width
5. **Performance**: Memoize parseResume, lazy load templates, code-split routes
6. **Styling**: Use semantic Tailwind classes (bg-surface, text-accent); never raw utilities like bg-gray-800
7. **AI Usage**: Check limits before AI calls; track monthly usage

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm run format       # Prettier format
```
