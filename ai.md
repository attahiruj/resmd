# resmd — AI Coding Agent Guide

## Project Overview

resmd is a resume builder platform where users write resumes in ResMarkup (plain-text syntax) and see them rendered through swappable templates. Content lives in plain text; the platform handles presentation.

## Key Technologies

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS with custom design system
- Supabase (PostgreSQL, Auth)
- OpenRouter API (AI features)
- @react-pdf/renderer (PDF export)
- CodeMirror 6 (editor)

## Core Concepts

### ResMarkup Syntax

Plain-text resume format with flexible structure:

```resmd
# Section Title
## Entry Heading
Key: Value
- bullet point
plain text
--- (page break)
```

### Parsing Model

The parser extracts structure without semantic interpretation:

- **ParsedResume**: sections[], meta, raw content, settings
- **ResumeMeta**: name, email, title (extracted from Bio section)
- **ResumeSection**: id, title, hint (keyvalue/entries/list/text/mixed), items[]
- **SectionItem**: KeyValueItem, EntryItem, BulletItem, TextItem

### Template System

Templates are decoupled renderers receiving ParsedResume:

- Follow standard rendering pattern: header → sections ordered by hint
- Create new template: add screen/pdf components + register in `/lib/templates.ts`
- Templates must handle all SectionItem types and never skip sections

### Variant System

- **Variants**: Independent resume versions forming a tree (cloned_from_id)
- Data: resume_variants table (id, user_id, title, raw_content, template_id, cloned_from_id, etc.)

### AI Features

AI enhances user content:

- Inline Enhancer: rewrites selected text with AI-powered improvements
- AI Chat: conversational assistant providing resume advice
- Model Selection: dynamic selection from available OpenRouter models
- AI uses OpenRouter API for streaming responses

## Essential Files

- `/types/resume.ts` - Canonical TypeScript types
- `/lib/parser.ts` - ResMarkup parsing logic
- `/lib/templates.ts` - Template registry
- `/lib/limits.ts` - Usage limits (see below)
- `/lib/ai.ts` - AI helper functions (streamEnhance, streamChat)
- `/app/globals.css` - Design tokens/CSS variables
- `/tailwind.config.js` - Semantic token mappings
- `/components/templates/` - Screen templates
- `/components/templates/pdf/` - PDF templates

## Development Guidelines

1. **Type Safety**: `tsc --noEmit` must pass with zero errors; no `any` types
2. **Limits**: Always import limits from `/lib/limits.ts`; never hardcode values
3. **Error Handling**: Handle network, empty, auth states; parser never throws
4. **Mobile**: Check layout at 375px width
5. **Performance**: Memoize parseResume, lazy load templates, code-split routes
6. **Styling**: Use semantic Tailwind classes (bg-surface, text-accent); never raw utilities like bg-gray-800
7. **AI Usage**: Check limits before AI calls; track monthly usage

## Current Limits

See `/lib/limits.ts`:

```typescript
export const LIMITS = {
  MAX_VARIANTS: 10,
  GUEST_VARIANTS: 1,
} as const;
```

These are enforced in API routes and variant service.

## Quick Reference

- **Parser**: `/lib/parser.ts` → `parseResume(raw: string): ParsedResume`
- **Templates**: `/lib/templates.ts` → `getAllTemplates()`, `getTemplate(id)`
- **Variants**: `/lib/variantService.ts` → CRUD operations
- **AI**: `/lib/ai.ts` → `streamEnhance()`, `streamChat()`
- **Limits**: `/lib/limits.ts` → LIMITS object
