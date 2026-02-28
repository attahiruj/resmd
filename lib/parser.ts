import { 
  ParsedResume, 
  ResumeSection, 
  ResumeMeta, 
  SectionItem, 
  SectionHint,
  EntryItem
} from '../types/resume'

/**
 * Pure TypeScript ResMarkup Parser
 * Stage 3 Implementation
 */

export function parseResume(raw: string): ParsedResume {
  const lines = raw.split(/\r?\n/)
  const sections: ResumeSection[] = []
  let currentSection: ResumeSection | null = null
  let currentEntry: EntryItem | null = null

  const slugify = (text: string) => 
    text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()

  const pushItem = (item: SectionItem) => {
    if (currentEntry && (item.kind === 'bullet' || item.kind === 'text')) {
      currentEntry.children.push(item)
    } else {
      if (currentEntry) {
        // If we are pushing a top-level item but had an active entry, 
        // that entry is now "finished" in terms of its children.
        currentEntry = null
      }
      if (currentSection) {
        currentSection.items.push(item)
        if (item.kind === 'entry') {
          currentEntry = item
        }
      }
    }
  }

  for (let line of lines) {
    const trimmedLine = line.trim()
    
    // 1. Blank lines are ignored
    if (trimmedLine === '') continue

    // 2. Sections (# )
    if (line.startsWith('# ')) {
      const title = line.substring(2).trim()
      currentSection = {
        id: slugify(title),
        title,
        hint: 'mixed', // placeholder
        items: []
      }
      sections.push(currentSection)
      currentEntry = null
      continue
    }

    // 3. Entries (## )
    if (line.startsWith('## ')) {
      const rawEntry = line.substring(3).trim()
      const parts = rawEntry.split('|').map(p => p.trim())
      const headingWithOrg = parts[0] || ''
      const meta = parts.slice(1)

      let role: string | null = null
      let organization: string | null = null
      let heading = headingWithOrg

      if (headingWithOrg.includes('@')) {
        const atParts = headingWithOrg.split('@')
        role = atParts[0]?.trim() || null
        organization = atParts.slice(1).join('@').trim() || null
      }

      const entry: EntryItem = {
        kind: 'entry',
        raw: rawEntry,
        heading,
        role,
        organization,
        meta,
        children: []
      }
      
      if (currentSection) {
        currentSection.items.push(entry)
        currentEntry = entry
      }
      continue
    }

    // 4. Bullets (- )
    if (line.startsWith('- ')) {
      pushItem({
        kind: 'bullet',
        text: line.substring(2).trim()
      })
      continue
    }

    // 5. KeyValueItems (Key: Value)
    const keyValueMatch = line.match(/^([A-Za-z][^:]+):\s*(.+)/)
    if (keyValueMatch) {
      pushItem({
        kind: 'keyvalue',
        key: keyValueMatch[1].trim(),
        value: keyValueMatch[2].trim()
      })
      continue
    }

    // 6. Everything else -> TextItem
    pushItem({
      kind: 'text',
      text: trimmedLine
    })
  }

  // Section Hint Assignment & Meta Extraction
  let meta: ResumeMeta = { name: null, email: null, title: null }

  for (const section of sections) {
    // 1. Assign Hints
    const counts: Record<string, number> = {
      keyvalue: 0,
      entry: 0,
      bullet: 0,
      text: 0
    }

    section.items.forEach(item => {
      counts[item.kind]++
    })

    const total = section.items.length
    let assignedHint: SectionHint = 'mixed'

    if (total > 0) {
      if (counts.keyvalue / total > 0.6) assignedHint = 'keyvalue'
      else if (counts.entry / total > 0.6) assignedHint = 'entries'
      else if (counts.bullet / total > 0.6) assignedHint = 'list'
      else if (counts.text / total > 0.6) assignedHint = 'text'
    }
    
    section.hint = assignedHint

    // 2. Extract Meta (first match wins across entire document)
    section.items.forEach(item => {
      if (item.kind === 'keyvalue') {
        const key = item.key.toLowerCase()
        if (!meta.name && key === 'name') meta.name = item.value
        if (!meta.email && key === 'email') meta.email = item.value
        if (!meta.title && (key === 'title' || key === 'role' || key === 'position')) {
          meta.title = item.value
        }
      }
    })
  }

  return {
    sections,
    meta,
    raw
  }
}

/**
 * Development utility to verify parser behavior
 */
export function runParserTests(): void {
  if (process.env.NODE_ENV !== 'development') return

  console.log('--- RUNNING PARSER TESTS ---')

  const tests = [
    {
      name: 'Standard Bio section',
      input: '# Bio\nName: Amara Osei\nEmail: amara@example.com\nTitle: Full Stack Engineer',
      check: (p: ParsedResume) => p.meta.name === 'Amara Osei' && p.sections[0].hint === 'keyvalue'
    },
    {
      name: 'Experience section with entries',
      input: '# Experience\n## Senior Engineer @ Paystack | 2022 - Present\n- Built stuff\n- Led team',
      check: (p: ParsedResume) => {
        const item = p.sections[0].items[0] as EntryItem
        return item.role === 'Senior Engineer' && item.organization === 'Paystack' && item.children.length === 2
      }
    },
    {
      name: 'Skills section (list hint)',
      input: '# Skills\n- TypeScript\n- React\n- Node.js',
      check: (p: ParsedResume) => p.sections[0].hint === 'list'
    },
    {
      name: 'Non-standard section name',
      input: '# Side Quests\nBuilding resmd in public.',
      check: (p: ParsedResume) => p.sections[0].title === 'Side Quests' && p.sections[0].id === 'side-quests'
    },
    {
      name: 'Entry with no @ separator',
      input: '# Projects\n## resmd Parser | 2024\n- Zero dependencies',
      check: (p: ParsedResume) => {
        const item = p.sections[0].items[0] as EntryItem
        return item.heading === 'resmd Parser' && item.role === null && item.organization === null
      }
    },
    {
      name: 'Entry with URL in meta',
      input: '# Links\n## GitHub | github.com/amaraosei | Primary',
      check: (p: ParsedResume) => (p.sections[0].items[0] as EntryItem).meta[0] === 'github.com/amaraosei'
    },
    {
      name: 'Mixed content',
      input: '# Mixed\nKey: Value\n## Entry\nParagraph text.',
      check: (p: ParsedResume) => p.sections[0].hint === 'mixed'
    },
    {
      name: 'Empty input',
      input: '',
      check: (p: ParsedResume) => p.sections.length === 0 && p.meta.name === null
    },
    {
      name: 'No sections',
      input: 'Just some text\n- and a bullet',
      check: (p: ParsedResume) => p.sections.length === 0 // items with no section are lost or should they be in a default section? 
      // Guide says: "Each # line creates a new ResumeSection... All subsequent items belong to this section"
      // So no section means items are effectively ignored or not attached to anything.
    },
    {
      name: 'Unicode characters',
      input: '# Bio\nName: Jędrzej Śniadecki',
      check: (p: ParsedResume) => p.meta.name === 'Jędrzej Śniadecki'
    },
    {
      name: 'Multiple KeyValue matches for meta',
      input: '# Bio\nName: First\n# Other\nName: Second',
      check: (p: ParsedResume) => p.meta.name === 'First'
    },
    {
      name: 'Entry with multiple | fields',
      input: '# Exp\n## Role @ Org | Date | Location | URL',
      check: (p: ParsedResume) => (p.sections[0].items[0] as EntryItem).meta.length === 3
    },
    {
      name: 'Section with only text paragraphs',
      input: '# About\nLine one.\nLine two.',
      check: (p: ParsedResume) => p.sections[0].hint === 'text'
    },
    {
      name: 'Malformed KeyValue (missing value)',
      input: '# Bio\nName:', // This won't match the regex /^[A-Za-z][^:]+:\s*.+/
      check: (p: ParsedResume) => p.sections[0].items[0].kind === 'text'
    },
    {
      name: 'Deeply nested structure (entry within entry - not supported, should flatten)',
      input: '# Test\n## Parent\n## Child',
      check: (p: ParsedResume) => p.sections[0].items.length === 2 && p.sections[0].items[0].kind === 'entry'
    }
  ]

  tests.forEach(t => {
    try {
      const result = parseResume(t.input)
      if (t.check(result)) {
        console.log(`PASS: ${t.name}`)
      } else {
        console.error(`FAIL: ${t.name}`)
        // console.log('Result:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error(`FAIL: ${t.name} (threw error)`)
      console.error(e)
    }
  })

  console.log('--- PARSER TESTS COMPLETE ---')
}
