/**
 * Prompt templates for the AI resume assistant.
 * Model: google/gemma-3n-e4b-it:free via OpenRouter
 */

/**
 * Builds the system prompt for the resume assistant.
 * Inject the current resume content so the model has full context.
 */
export function buildSystemPrompt(resumeContent: string): string {
  return `You are an expert resume coach and copywriter helping users craft compelling, targeted resumes.

The user's resume uses **ResMarkup** — a lightweight plain-text format:
- \`# Section Name\` — top-level section (e.g. \`# Experience\`, \`# Skills\`)
- \`## Entry Title\` — sub-entry within a section (e.g. \`## Software Engineer at Acme\`)
- \`Key: Value\` — structured field within an entry (e.g. \`Date: Jan 2022 – Present\`)
- Plain lines — free-form description or bullet text

## Behavior guidelines
- Be concise and direct. Give 1–3 focused, actionable suggestions unless the user asks for more.
- Prioritize impact: quantify achievements, use strong action verbs, tailor language to the role.
- Do not invent job history, skills, or credentials the user has not mentioned.
- If the user's request is ambiguous, ask one clarifying question rather than guessing.
- Keep responses short — this is a chat interface, not an essay.

## Suggesting edits
When you want to change specific text in the resume, use this exact format.
Copy the SEARCH text character-for-character as it appears in the resume — do not paraphrase or reformat it.

<<<SEARCH>>>
exact text from the resume to replace
<<<REPLACE>>>
improved replacement text
<<<END>>>

You may include multiple edit blocks in one response. After the blocks, add a one-sentence explanation of what you changed and why.

## Current resume
\`\`\`
${resumeContent || '(no resume content yet)'}
\`\`\``;
}

/** OpenRouter model identifier — override via OPENROUTER_MODEL env var */
export const AI_MODEL =
  process.env.OPENROUTER_MODEL ?? 'google/gemma-3n-e4b-it:free';

/** Max tokens to request from the model */
export const AI_MAX_TOKENS = 1024;

// ---------------------------------------------------------------------------
// Edit parsing
// ---------------------------------------------------------------------------

export interface Edit {
  search: string;
  replace: string;
}

export interface ParsedReply {
  prose: string;
  edits: Edit[];
}

const BLOCK_RE = /<<<SEARCH>>>([\s\S]*?)<<<REPLACE>>>([\s\S]*?)<<<END>>>/g;

/**
 * Splits an AI reply into conversational prose and structured edit blocks.
 * Edit blocks are stripped from the prose so the chat bubble stays clean.
 */
export function parseSuggestion(reply: string): ParsedReply {
  const edits: Edit[] = [];
  let match: RegExpExecArray | null;

  BLOCK_RE.lastIndex = 0;
  while ((match = BLOCK_RE.exec(reply)) !== null) {
    const search = match[1].trim();
    const replace = match[2].trim();
    if (search) edits.push({ search, replace });
  }

  const prose = reply.replace(/<<<SEARCH>>>[\s\S]*?<<<END>>>/g, '').trim();
  return { prose, edits };
}
