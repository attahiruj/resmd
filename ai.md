# resmd — Project Description & AI Implementation Guide

> This document describes what resmd is, the core design philosophy, data model, syntax, and system architecture. It is the source of truth for all product decisions. Read this before touching any code.

---

## What Is resmd

resmd is a resume builder platform where users write resumes in **ResMarkup** — a lightweight plain-text syntax — and see them rendered live through beautiful, swappable templates. The core promise: your content lives in plain text you fully control, and the platform handles presentation.

Key differentiators:

- **ResMarkup** — write your resume like a text file, not a form
- **No rigid structure** — users define their own sections; the parser adapts to them
- **Resume variants** — manage multiple tailored versions (Software Engineering CV, Java Dev CV, Freelance Portfolio) as a visual tree where any variant can be cloned from any other
- **AI woven in** — enhances your words, never replaces your voice
- **Templates as skins** — swap the entire visual presentation without touching content

---

## ResMarkup Syntax

ResMarkup is section-based. The parser makes no assumptions about what sections exist or what they mean. Users have full control.

### Rules

```text
# Section Title         → starts a new section (any name the user wants)
## Entry Heading        → starts an entry within a section
Key: Value              → a key-value pair (within any section)
- bullet text           → a bullet point (under current section or entry)
plain text              → a paragraph (under current section or entry)
---                     → page braks
blank lines             → ignored, used freely as breathing room
```

### Separator conventions (for entry headings)

The parser recognizes these separators within `##` headings to extract metadata:

- `@` separates a role/title from an organization
- `|` separates metadata fields (organization, date range, URL, etc.)

These are **conventions, not requirements**. The parser extracts what it can and stores the rest as the raw heading string. Nothing breaks if the user doesn't follow them.

### Example — standard use

```text
# Bio
Name: Attahiru Jibril
Title: Senior Software Engineer
Email: attahiru@email.com
Location: Kano, Nigeria
LinkedIn: linkedin.com/in/attahiru
GitHub: github.com/attahiru

# Summary
Passionate engineer with 5 years building scalable backend systems
across fintech and logistics domains.

# Work Experience
## Software Engineer @ Andela | 2021 – Present
- Built microservices handling 500k daily requests
- Led a team of 4 engineers on a cross-border payment integration

## Junior Developer @ StartupXYZ | 2019 – 2021
- Reduced page load time by 40% through Redis caching
- Owned the entire frontend rewrite in React

# Education
## B.Sc Computer Science @ Bayero University Kano | 2015 – 2019
Graduated Second Class Upper. Final year project: distributed task scheduler.

# Skills
Languages: Python, TypeScript, Go, Java
Frameworks: FastAPI, NestJS, React, Spring Boot
Tools: Docker, Kubernetes, PostgreSQL, Redis

# Projects
## resmd Parser | github.com/attahiru/resmd | 2024
A flexible plain-text syntax for writing resumes — open source.
- Zero dependencies, written in TypeScript
- 200+ GitHub stars in first month

# Certifications
AWS Solutions Architect Associate | Amazon Web Services | 2022
Google Cloud Professional Data Engineer | Google | 2023
```

### Example — non-standard sections (works exactly the same)

```text
# Speaking Engagements
## "Scaling APIs in Africa" @ PyCon Nigeria | Nov 2023
Keynote address on building infrastructure for low-bandwidth environments.

# Open Source Contributions
## Django REST Framework | github.com/encode/django-rest-framework
- Fixed 3 issues related to nested serializer validation
- Merged PR improving pagination performance by 60%

# Languages
English: Native
Hausa: Native
French: Conversational

# Interests
Distributed systems, technical writing, football analytics
```

All of this parses cleanly. The parser does not care that "Speaking Engagements" or "Open Source Contributions" are not in any predefined list.

---

## The Parsing Model

The parser's job is **structure extraction**, not **semantic interpretation**. It reads ResMarkup and produces an ordered list of sections, each containing a list of items. It does not decide what sections mean. Templates and AI layers do that.

### Output Types

```typescript
// ─── Core parsed output ───────────────────────────────────────────────────

export interface ParsedResume {
  sections: ResumeSection[]   // ordered exactly as user wrote them
  meta: ResumeMeta            // lightweight: only truly universal fields
  raw: string                 // original ResMarkup, always preserved verbatim
}

// Meta exists only for things the platform needs regardless of template:
// PDF filename, Open Graph tags, shareable link title, etc.
// Extracted from the first section where Name: is found (usually Bio).
export interface ResumeMeta {
  name: string | null
  email: string | null        // for PDF mailto links
  title: string | null        // professional title/role
}

// ─── Section ──────────────────────────────────────────────────────────────

export interface ResumeSection {
  id: string                  // slugified title: "work-experience", "bio"
  title: string               // exactly as user wrote: "Work Experience", "Bio"
  hint: SectionHint           // parser's soft inference for template layout hints
  items: SectionItem[]        // ordered list of everything in this section
}

// hint is the parser's best guess at the dominant content pattern.
// Templates MAY use this to choose a layout. They are NOT required to.
// User's section title always takes precedence over hint in any UI display.
export type SectionHint =
  | 'keyvalue'    // mostly Key: Value pairs (e.g. Bio, Languages)
  | 'entries'     // mostly ## sub-entries (e.g. Experience, Education)
  | 'list'        // mostly - bullet points (e.g. Skills as flat list)
  | 'text'        // mostly plain paragraphs (e.g. Summary, Interests)
  | 'mixed'       // combination — template decides how to render

// ─── Section Items ────────────────────────────────────────────────────────

// A section contains an ordered list of items. Each item is one of these types.
// The discriminated union lets templates handle each type explicitly.

export type SectionItem =
  | KeyValueItem
  | EntryItem
  | BulletItem
  | TextItem

export interface KeyValueItem {
  kind: 'keyvalue'
  key: string
  value: string
}

export interface EntryItem {
  kind: 'entry'
  raw: string             // the full ## line exactly as written
  heading: string         // everything before the first |
  role: string | null     // extracted: part before @ in heading
  organization: string | null  // extracted: part after @ in heading
  meta: string[]          // remaining | separated fields (dates, URLs, etc.)
  children: SectionItem[] // bullets and text nested under this entry
}

export interface BulletItem {
  kind: 'bullet'
  text: string
}

export interface TextItem {
  kind: 'text'
  text: string
}
```

### Hint Inference Rules

The parser assigns a `SectionHint` based on the dominant item type in the section:

- If >60% of items are `keyvalue` → `'keyvalue'`
- If >60% of items are `entry` → `'entries'`
- If >60% of items are `bullet` → `'list'`
- If >60% of items are `text` → `'text'`
- Otherwise → `'mixed'`

This is a soft signal. Templates can ignore it entirely.

### What the Parser Does NOT Do

- Does not validate section names
- Does not require any specific section to exist
- Does not fail on unknown patterns — unknown lines become `TextItem`
- Does not transform, normalize, or editorialize the user's content
- Does not reorder sections
- Does not infer meaning from section titles (that's the AI layer's job if needed)

---

## Template System

Templates are **renderers**. They receive `ParsedResume` and produce a visual layout. They are fully decoupled from the parser. A template can:

- Render all sections in order (most templates)
- Look for a section by title and give it special treatment (e.g. render "Bio" at the top specially)
- Use `section.hint` to pick a sub-layout for a section
- Ignore sections it doesn't recognize
- Render sections it doesn't recognize in a generic fallback layout

### Template Definition

```typescript
export interface TemplateDefinition {
  id: string
  name: string
  description: string
  category: 'minimal' | 'professional' | 'creative' | 'technical' | 'academic'
  isPro: boolean
  thumbnail: string                                         // path to preview image
  component: React.ComponentType<TemplateProps>             // screen renderer
  pdfComponent: React.ComponentType<TemplateProps>          // @react-pdf/renderer version
}

export interface TemplateProps {
  resume: ParsedResume
  isPro: boolean    // so template can conditionally show/hide watermark
}
```

### Template Rendering Pattern

Every template should follow this pattern:

```typescript
// 1. Find the Bio/header section (look for section where hint = 'keyvalue' or title matches 'bio')
// 2. Render the header specially (name, title, contact row)
// 3. Loop through all remaining sections in order
// 4. For each section, pick a layout based on section.hint:
//      'keyvalue' → render as a two-column key/value table or inline list
//      'entries'  → render as timeline or card list
//      'list'     → render as bullet list or tag cloud
//      'text'     → render as paragraph
//      'mixed'    → render items in sequence, switching layout per item type
// 5. Never skip a section silently — always render something
```

This means a user with a `# Speaking Engagements` section will always see it rendered, even in a template that never anticipated that section existing.

### Adding a New Template

1. Create `/components/templates/YourTemplate.tsx`
2. Create `/components/templates/pdf/YourTemplate.tsx`
3. Add one entry to the registry in `/lib/templates.ts`

That's it. No other files change.

---

## Variant System

### Concept

A **variant** is a complete, independent version of a resume. Variants are not small edits — they are meaningfully different resumes tailored for different purposes.

Examples:

- "Main CV" → cloned to → "Software Engineering" → cloned to → "Java Backend Roles"
- "Main CV" → cloned to → "Freelance Portfolio"
- "Academic CV" → cloned to → "Industry Transition CV"

Variants form a **tree**. Any variant can be cloned from any other at any time. Forking copies the full ResMarkup content of the source as the starting point for the new variant.

The tree is rendered as a visual node graph in the dashboard — the centerpiece UI of the product.

### Variants vs Snapshots

| | Variants | Snapshots |
| --- | --- |
| **What** | Distinct resume versions | Recovery points within one variant |
| **When created** | User explicitly forks | User explicitly saves, or auto-save |
| **Relationship** | Tree (parent/child) | Linear list per variant |
| **User intent** | "I need a different resume for this" | "Save my progress" |
| **UI** | Visual tree in dashboard | History panel in editor |

### Data Model

```text
resume_variants
  id, user_id, title, raw_content, template_id,
  cloned_from_id (→ resume_variants.id), is_public, public_slug,
  created_at, updated_at

variant_snapshots
  id, variant_id, raw_content, message, template_id, created_at
```

The tree structure is implicit in `cloned_from_id` links. To render the tree: load all variants for the user, walk the parent links, compute positions.

---

## AI Layer

AI is additive — it enhances what the user wrote, never generates content from nothing.

### AI Features

**Bullet Enhancer** — user selects a bullet or entry, AI rewrites it to be more impactful (strong verbs, quantification suggestions). User sees a diff and accepts or dismisses.

**Section Reviewer** — AI reads any section and returns specific feedback: weak phrases, missing quantification, inconsistent tense, clichés.

**Full Resume Review** — returns an overall score (0–100), list of issues, list of strengths.

**Job Match** — user pastes a job description, AI compares it against the resume and returns: match score, skills present, skills missing, suggested additions.

**Summary Generator** — AI generates a professional summary based on the rest of the resume content. User edits before accepting.

### AI and the Flexible Model

Because sections are freeform, AI prompts always receive the **raw ResMarkup** as input, not the parsed structure. This is intentional — the raw text is more natural for LLMs and avoids any information loss from parsing. Structured output from AI (scores, issues lists) is requested as JSON via the system prompt.

---

## Essential References

Before any stage, read these files:

- **`/types/resume.ts`** — Canonical TypeScript types (never deviate)
- **`/lib/parser.ts`** — ResMarkup parser logic
- **`/lib/themes.ts`** — Theme definitions
- **`/app/globals.css`** — Design tokens (CSS variables)
- **`/tailwind.config.js`** — Semantic token mappings

---

## Definition of Done (every stage)

- [ ] `tsc --noEmit` passes with zero errors
- [ ] No `any` types introduced
- [ ] Feature works end-to-end in browser
- [ ] Mobile layout checked at 375px width
- [ ] Error states handled (network, empty, auth)
- [ ] Always import limits from `/lib/limits.ts` — never hardcode

---

## Design System Summary

**Reference:** Full token definitions in `/app/globals.css` and `/tailwind.config.js`

- **Default theme:** Dark mode (`bg: #0D0F14`, `text: #E8E6DF`)
- **Accent color:** `#C8F135` (Citron Spark) — CTAs, focus rings, active states
- **Secondary/AI:** `#4DAAFF` (Glacier Blue) — AI panel exclusively
- **Fonts:** Display: Instrument Serif, UI: DM Sans, Mono: Geist Mono
- **CSS variables:** All colors defined as `--color-*` in `:root`
- **Tailwind mapping:** Use semantic classes like `bg-surface`, `text-accent`, NOT raw `bg-gray-800`
- **localStorage keys:** `resmd_theme`, `resmd_theme_id`, `resmd_split`

> **Rule:** Never use raw Tailwind color utilities (`bg-gray-800`, `text-zinc-400`). Always use semantic token classes.

---

## Surface Layering

```text
Page background     → bg           (#0D0F14)
Panels / sidebars   → surface      (#111520)
Inputs / list rows  → surface-2    (#181D2E)
Active / hover      → surface-3    (#1F2640)
Modals / overlays   → surface + shadow-lg + surface-overlay
```

---

## Component Patterns

### Buttons

- Primary: `bg-accent text-accent-text rounded-md px-4 py-2 hover:bg-accent-hover`
- Secondary: `bg-surface-2 text-text border border-border rounded-md hover:bg-surface-3`
- Ghost: `bg-transparent text-muted rounded-md hover:bg-surface-2 hover:text-text`
- AI: `bg-secondary-muted text-secondary rounded-md hover:bg-secondary hover:text-bg`

### Inputs

`bg-surface-2 text-text border border-border rounded-md px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent`

### Cards

`bg-surface border border-border rounded-xl p-5 shadow-md`

### Badges

- Accent: `bg-accent-muted text-accent rounded-sm px-2 py-0.5 text-label-sm font-600`
- AI: `bg-secondary-muted text-secondary rounded-sm px-2 py-0.5 text-label-sm`

---

## Editor Layout

- Split: markdown editor (left) + live preview (right)
- Divider: `w-1 bg-border hover:bg-accent cursor-col-resize`
- Split position: `localStorage` key `resmd_split`, min pane 320px
- Mobile (<768px): single-pane with Write/Preview tab bar

---

## Quick Reference — Key Files

| Purpose | File |
| --- | --- |
| All types | `/types/resume.ts` |
| Parser | `/lib/parser.ts` |
| Templates | `/lib/templates.ts` |
| DB ops | `/lib/variantService.ts` |
| Limits | `/lib/limits.ts` |
| AI helpers | `/lib/ai.ts` |
| Themes | `/lib/themes.ts` |

---

## Stage 1 — Project Scaffold

Set up Next.js 14 with App Router, TypeScript (strict), Tailwind.

**Install:** `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `@anthropic-ai/sdk`, `codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`, `@codemirror/theme-one-dark`, `@react-pdf/renderer`, `stripe`, `@stripe/stripe-js`

**Create structure:**

- `/types/resume.ts` — Exact types: `ParsedResume`, `ResumeMeta`, `ResumeSection`, `SectionHint`, `SectionItem` (KeyValueItem, EntryItem, BulletItem, TextItem), `TemplateDefinition`, `TemplateProps`, `ResumeVariant`, `VariantSnapshot`, `UserProfile`
- `/lib/limits.ts` — `LIMITS` object with FREE_VARIANTS, FREE_AI_PER_MONTH, FREE_SNAPSHOTS, PRO_PRICE_MONTHLY
- `/lib/supabase.ts` — Browser client
- `/lib/supabase-server.ts` — Server client for API routes
- `.env.local.example` — All required env vars
- `/app/layout.tsx` — With Tailwind, dark background, app name "resmd"
- `/app/globals.css` — Full CSS variable system (reference the design tokens section above)
- Update `tailwind.config.js` — Extend with semantic colors

**Scaffold only.** No UI features yet.

---

## Stage 2 — Database Setup

Run this SQL in Supabase dashboard:

```sql
-- Enable UUID
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_pro boolean default false,
  stripe_customer_id text,
  pro_expires_at timestamptz,
  ai_usage_this_month int default 0,
  ai_usage_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Auto-create profile
create or replace function handle_new_user() returns trigger as $$
begin insert into profiles (id, email) values (new.id, new.email); return new; end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure handle_new_user();

-- Resume variants
create table resume_variants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null default 'My Resume',
  raw_content text not null default '',
  template_id text not null default 'minimal',
  cloned_from_id uuid references resume_variants(id) on delete set null,
  is_public boolean default false,
  public_slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Snapshots
create table variant_snapshots (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid references resume_variants(id) on delete cascade,
  raw_content text not null,
  message text not null default 'Saved',
  template_id text not null,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table resume_variants enable row level security;
alter table variant_snapshots enable row level security;

create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own variants" on resume_variants for all using (auth.uid() = user_id);
create policy "Public variants readable by anyone" on resume_variants for select using (is_public = true);
create policy "Users manage snapshots for own variants" on variant_snapshots for all using (
  exists (select 1 from resume_variants rv where rv.id = variant_snapshots.variant_id and rv.user_id = auth.uid())
);

-- Indexes
create index on resume_variants(user_id);
create index on resume_variants(cloned_from_id);
create index on variant_snapshots(variant_id);
```

No code changes — SQL only.

---

## Stage 3 — The ResMarkup Parser

Create `/lib/parser.ts`:

**Export:** `parseResume(raw: string): ParsedResume`

**Rules:**

- `#` → new Section (title = after `#`)
- `##` → new Entry in current section
- `-` → BulletItem
- `/^[A-Za-z][^:]+:\s*.+/` → KeyValueItem (split on first `:`)
- Blank → ignored
- Everything else → TextItem

**Entry parsing:**

- heading = before first `|`, role = before `@`, org = after `@`
- meta = remaining `|` fields, children = following bullets/text until next ## or #

**SectionHint:** Assign based on dominant item type (>60%), else 'mixed'

**ResumeMeta:** Extract name/email/title from KeyValueItems across all sections

**Dev utility:** `runParserTests()` — 15+ test cases, guarded with `NODE_ENV !== 'development'`

**Never throw** — best-effort output on errors.

---

## Stage 4 — Template System + First Template

1. **`/lib/templates.ts`** — Export `getAllTemplates()`, `getTemplate(id)`, `getFreeTemplates()`. Register: minimal, modern, technical (free), executive, creative (pro). Use React.lazy().

2. **`/components/templates/Minimal.tsx`** — Props: `TemplateProps`
   - Find header section (first, or hint='keyvalue', or title='bio')
   - Render name large, title muted, contact row inline
   - Remaining sections: render title (uppercase, small), then items
   - Handle all SectionItem types
   - isPro=false: add "Created with resmd" footer

3. **`/components/preview/LivePreview.tsx`** — Calls `parseResume()` memoized on rawContent, renders template, scales to fit container

4. **`/components/preview/EmptyState.tsx`** — Centered layout with example ResMarkup snippet

---

## Stage 5 — Editor Page (No Auth)

Build `/app/editor/page.tsx` — no auth, localStorage only.

1. **`/components/editor/Editor.tsx`** — CodeMirror 6
   - Markdown mode, no line numbers, soft wrap
   - Zoom: Ctrl+= / Ctrl+- / Ctrl+0 (10-24px range)
   - Custom syntax highlighting: `#` = accent section, `##` = entry, `-` = muted bullet, keys = accent
   - Debounce 500ms save to localStorage "resmd_draft"

2. **`/components/editor/Toolbar.tsx`** — 52px, surface background
   - Left: "resmd" wordmark
   - Right: theme toggle, AI button, save (disabled), export (disabled)
   - Template selector NOT in toolbar (moved to preview pane)

3. **`/app/editor/page.tsx`**
   - State: rawContent, templateId, showAIPanel, splitPct (default 50), mobileTab
   - Desktop: split pane with draggable divider
   - Mobile: tab bar (Write/Preview pills)

4. **`/components/preview/PreviewPane.tsx`** — Contains LivePreview + floating template picker at bottom

**Default content:** See original guide for the Amara Osei resume example.

---

## Stage 6 — Auth + Saving + Variant Service

1. **`/app/auth/page.tsx`** — Sign in/Create account tabs, email/password + Google OAuth, redirect to /dashboard

2. **`/lib/variantService.ts`** — All async Supabase operations:
   - `createVariant(userId, title, rawContent, templateId)` — creates initial snapshot
   - `updateVariantContent(variantId, rawContent, templateId)` — auto-save, no snapshot
   - `saveSnapshot(variantId, rawContent, message, templateId)` — enforce FREE_SNAPSHOTS limit
   - `getUserVariants(userId)`, `getVariant(id)`, `getVariantSnapshots(id)`
   - `forkVariant(sourceId, newTitle, userId)` — copies content, sets cloned_from_id
   - `deleteVariant(id)`, `getUserProfile(id)`

3. **`/app/editor/[variantId]/page.tsx`** — Server component loads variant, client EditorClient handles state

4. **`/components/editor/SnapshotModal.tsx`** — Input for message, placeholder suggestions

5. **`/hooks/useProfile.ts`** — Returns user, profile, isPro, loading, error + refresh()

6. **`/app/dashboard/page.tsx`** — Show variant cards, New button (check FREE_VARIANTS limit), edit/fork/delete actions

---

## Stage 7 — Clone Support

1. **`/components/variants/CloneModal.tsx`** — Input for new title, suggested chips, confirm/cancel

2. **`/app/api/variants/[id]/clone/route.ts`** — POST, calls cloneVariant, enforces variant limit

3. **Update Dashboard** — Show "Cloned from [parent]" line, clone action opens CloneModal

---

## Stage 8 — AI feature

### 8a. Enhance (Inline AI)

**Feature:** When user selects text in the editor, show a floating toolbar with an AI button. Clicking it opens an input overlay where user can type instructions. The selected text serves as context.

1. **`/components/editor/SelectionToolbar.tsx`** — Floating toolbar that appears on text selection
   - Position: absolute, above selection using `getBoundingClientRect()`
   - Single AI button: `bg-secondary-muted text-secondary rounded-md hover:bg-secondary hover:text-bg`
   - Show on `selectionchange` event or CodeMirror selection event
   - Hide when selection is empty or outside editor

2. **`/components/editor/EnhanceInput.tsx`** — Overlay input that appears when AI button clicked
   - Position: below the toolbar, centered
   - Textarea: auto-expand, placeholder "Improve this section..."
   - Shows selected text as context (read-only, muted style)
   - Send button: `bg-secondary text-bg rounded-md hover:bg-secondary-hover`
   - Close on send, cancel (Escape), or click outside
   - State: isOpen, selectedText, instruction

3. **`/app/api/ai/enhance/route.ts`** — POST
   - Auth required
   - Check ai_usage_this_month vs LIMITS.FREE_AI_PER_MONTH
   - Request body: `{ selectedText: string, instruction: string, resumeContext: string }`
   - Prompt: Include selected text + instruction + surrounding context from resume
   - Output: Plain text replacement or `<<<SUGGESTION>>> [content] <<<END>>>` format
   - Stream response back to client

4. **`/lib/ai.ts`** — Add:
   - `streamEnhance(instruction, selectedText, resumeContext, onChunk, onDone, onError)` → AbortController
   - Returns replacement text to apply

5. **Editor Integration**
   - Wrap Editor in a container with `position: relative`
   - Render SelectionToolbar and EnhanceInput as siblings, absolutely positioned
   - On enhance complete: replace selected range with AI response
   - Use CodeMirror `replaceSelection()` or transaction for replacement

---

### 8b. AI Chat Panel (Full Resume)

1. **`/app/api/ai/chat/route.ts`** — POST
   - Auth required
   - Check ai_usage_this_month vs LIMITS.FREE_AI_PER_MONTH (Pro check coming soon)
   - Increment usage, handle monthly reset
   - Stream Anthropic response (model: claude-haiku-4-5-20251001)
   - System prompt includes current resume content
   - Output format: `<<<SUGGESTION>>> SECTION: [title] --- [content] <<<END>>>` for rewrites

2. **`/lib/ai.ts`** — Client helper:
   - `streamChat(message, resumeContent, history, onChunk, onDone, onError)` → AbortController
   - `parseSuggestion(fullText)` → extracts section + content from SUGGESTION block

3. **`/components/editor/AIPanel.tsx`** — 380px slide-in from right
   - Header: "AI" label, usage pill, close button
   - Messages: assistant bubbles (markdown), user bubbles, suggestion cards
   - Suggestion card: shows replacement, Accept (applies) / Dismiss buttons
   - Quick chips: "Review my resume", "Improve bullet points", "Write summary"
   - Input: auto-expand textarea, Enter sends
   - State: messages[], input, isStreaming, abortRef

4. **Update editor** — Pass `rawContent` and `onApplySuggestion` to AIPanel

---

## Stage 9 — PDF Export + More Templates

1. **`/app/api/export/pdf/route.ts`** — POST with {variantId}
   - Auth + ownership check
   - Parse with parseResume()
   - Render PDF with @react-pdf/renderer using template's pdfComponent
   - Return PDF with proper Content-Type and filename

2. **PDF templates** — `/components/templates/pdf/Minimal.tsx`, Modern.tsx, Technical.tsx
   - A4, 40pt margins, Helvetica font
   - Follow same rendering strategy as screen versions
   - isPro=false: add "Created with resmd" footer

3. **Screen templates** — Modern (two-column), Technical (monospace headers, skills grid)

4. **Update toolbar** — Export button calls PDF API, show loading spinner, free users see "(watermarked)"

---

## Stage 10 — Public Shareable Links

1. **`/lib/variantService.ts`** — Add:
   - `publishVariant(id)` — generate slug (adjective-noun-4digits), set is_public=true
   - `unpublishVariant(id)` — set is_public=false

2. **`/app/api/variants/[id]/publish/route.ts`** — POST/DELETE, requires auth + ownership

3. **`/app/r/[slug]/page.tsx`** — SSR, load by public_slug, render template full-page
   - Bottom bar: Download PDF, "Create your resume →"
   - Open Graph meta tags

4. **`/components/editor/ShareModal.tsx`** — Toggle public, show URL + copy + QR (pro), ProGate for free users

5. **Add share button** to toolbar

---

## Stage 11 — Polish + Launch

1. **Error handling:** React ErrorBoundary wrapping editor, parser never throws, all API routes return valid JSON

2. **Loading states:** Skeleton UI for dashboard list, editor content, AI panel, export button

3. **Onboarding:** 3-step modal for first visit (localStorage "resmd_onboarded")

4. **SEO:** OG tags on all pages (layout, pricing, /r/[slug], landing)

5. **Performance:** Memoize parseResume, lazy load templates, code-split /r/[slug]

6. **Rate limiting:** Max 1 AI requests/minute per user, return 429 on exceed

7. **Mobile:** Test at 375px/428px, verify tab switching, modals, touch targets

8. **Landing page:** Hero, features, template gallery, pricing, footer

9. **Env validation:** Check required env vars exist at startup, throw clear error if missing

---