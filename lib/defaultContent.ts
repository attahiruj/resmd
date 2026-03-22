export const DEFAULT_RESUME_CONTENT = `// Welcome to resmd! Lines starting with // are comments — they won't appear in your resume.
// Edit the content below and watch the preview update live on the right.

// ── SECTIONS ──────────────────────────────────────────────────────────────────
// Use  #  to create a section. You can name them anything you like:
//   # Experience   # Education   # Projects   # About Me   # Volunteering

# Bio
// Key: Value pairs are great for contact info and metadata.
// The "Name", "Email", and "Title" keys are special — they populate the resume header.
//
// ── LINKS ─────────────────────────────────────────────────────────────────────
// Two ways to make a clickable link:
//   1. Key: Value  where value starts with https:// — auto-linked in the header
//        GitHub: https://github.com/amaraosei
//   2. [Label](https://url)  inline syntax — works anywhere (bullets, text, bio)
//        - Check out [my portfolio](https://amara.design)
// Bare domains like "github.com/foo" are plain text and won't be clickable.
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: https://github.com/amaraosei
LinkedIn: https://linkedin.com/in/amaraosei

# Summary
// Plain text lines become paragraphs. Great for a summary or personal statement.
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
// ── ENTRIES ───────────────────────────────────────────────────────────────────
// Use  ##  to create an entry (job, degree, project, etc.)
// Format:  ## Role @ Organization | Date | Optional extra fields
// The  @  splits role from organization. Fields after  |  are metadata (date, location, URL…).
## Senior Engineer @ Paystack | 2022 – Present
// Bullet points (- ) belong to the entry above them.
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
- First Class Honours.
- Final year project: real-time collaborative code editor.

# Skills
// Key: Value pairs in a section are rendered as a definition list — perfect for skills.
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
// Entries without  @  are treated as standalone headings (no role/org split).
// Extra  |  fields after the title become metadata — handy for URLs and dates.
## resmd | github.com/amara/resmd | 2024
// Plain text under an entry becomes a short description line.
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
// A lone text line with no  ##  prefix is rendered as a simple text item.
AWS Solutions Architect Associate | Amazon | 2023

// ── DIRECTIVES ────────────────────────────────────────────────────────────────
// Fine-tune layout with  !key: value  directives (remove the leading // to activate):
// !font.size: 11
// !line.height: 1.4
// !margin.h: 48
// !margin.v: 40
// !entry.spacing: 6`;

export const TEMPLATE_CONTENT: Record<string, string> = {
  minimal: DEFAULT_RESUME_CONTENT,
  modern: DEFAULT_RESUME_CONTENT,
  technical: DEFAULT_RESUME_CONTENT,

  executive: `# Bio
Name: Amara Osei
Title: Senior Engineering Lead
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Strategic engineering leader with 6+ years of experience building and scaling high-performance teams.
Proven track record of delivering mission-critical systems serving millions of users.
Passionate about building inclusive engineering cultures and developing future leaders.

# Experience
## Engineering Lead @ Paystack | 2022 – Present
- Led team of 8 engineers building payment infrastructure processing $2B annually
- Established engineering best practices and code review standards
- Mentored 3 engineers into senior roles, all promoted within 18 months

## Senior Engineer @ Andela | 2020 – 2022
- Architected React component library used across 12 client projects
- Technical interview panel member, conducted 100+ interviews

# Education
## MBA @ Lagos Business School | 2022
Strategic Management

## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours

# Skills
Leadership: Team Building, Strategic Planning, Budget Management
Tech: TypeScript, Python, Go, React, Node.js, PostgreSQL, AWS

# Certifications
AWS Solutions Architect Associate | Amazon | 2023
Executive Leadership | Stanford Graduate School of Business | 2024`,

  creative: `# Bio
Name: Amara Osei
Title: Creative Developer & Designer
Email: amara@example.com
Location: Lagos, Nigeria
Portfolio: amara.design
GitHub: github.com/amaraosei

# About
I build digital experiences that users love. With a unique blend of design sensibility
and engineering rigor, I create products that are both beautiful and functional.

# Experience
## Creative Developer @ Digital Agency | 2022 – Present
- Built award-winning interactive experiences for Fortune 500 clients
- Combined motion design with performant code
- Reduced page load times by 40% while adding animations

## Frontend Developer @ Startup | 2020 – 2022
- Designed and built product UI from scratch
- Created design system used across 8 products
- Increased user engagement by 60%

# Education
## B.Design @ Creative Arts Institute | 2016 – 2020
Major in Interactive Design, Minor in Computer Science

# Skills
Design: Figma, Adobe XD, Motion Design, UI/UX
Code: TypeScript, React, Three.js, WebGL, CSS Animations

# Selected Work
## Interactive Data Visualization | 2023
Award-winning data visualization for climate change data
- Featured in Awwwards SOTD
- 500k+ views

# Let's Connect
Open to creative development opportunities and design engineering roles.`,
};
