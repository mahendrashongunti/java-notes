# Java Notes

A content-first documentation site for advanced Java and backend engineering: deep notes, runnable
code, diagrams, revision sheets and interview questions. Inspired by the structure of
[java.harshpreet.com](https://java.harshpreet.com/learn), but built as a Git-backed MDX site with no
database, auth, backend or dashboard.

## Stack

- Next.js 16 (App Router, React Server Components) + TypeScript
- Tailwind CSS v4 with shadcn/ui-style primitives (Radix + CVA) and CSS-variable theming
- MDX via `next-mdx-remote/rsc`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- Shiki through `rehype-pretty-code` (light/dark dual theme)
- Local Geist fonts (`geist` package) — no build-time font downloads
- Static generation for every route; search is a build-time index, not a service

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build, all routes prerendered
npm run start      # serve the build
npm run typecheck  # tsc --noEmit
npm run validate   # content schema, ordering, internal links and anchors
npm run check      # typecheck + validate + production build
```

Set `NEXT_PUBLIC_SITE_URL` to the real origin before deploying (used by metadata, sitemap and
robots).

## Blueprint

### Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | static | Landing page: pitch, featured chapters, recently updated, tracks |
| `/learn` | static | Course index: every track, module and chapter |
| `/learn/<track>` | SSG | Track overview, e.g. `/learn/java` |
| `/learn/<track>/<module>` | SSG | Module overview, e.g. `/learn/java/core-java` |
| `/learn/<track>/<module>/<chapter>` | SSG | Chapter, e.g. `/learn/java/core-java/generics-and-type-erasure` |
| `/sitemap.xml`, `/robots.txt` | static | SEO |

### Shell

- Sticky header: wordmark, primary nav, ⌘K search, theme switch, GitHub link, mobile sheet nav.
- Docs layout: 260px sidebar (tracks → modules → chapters), fluid article column capped at a
  readable measure, 216px table of contents with scroll-spy, hidden below `lg`/`xl`.
- Mobile: sidebar becomes a sheet; the table of contents collapses into a `<details>` block.
- Dark mode via `next-themes` with `class` strategy and no flash (suppressHydrationWarning).

### Content model

```
content/
├── java/
│   ├── _meta.json              # track title, description, order
│   ├── core-java/
│   │   ├── _meta.json          # module title, description, order
│   │   └── *.mdx
│   ├── collections/ concurrency/ jvm/
├── spring-boot/  postgresql/  backend-engineering/  java-fullstack/
├── books/  courses/  interview-questions/  quick-notes/
```

`lib/content.ts` scans `content/` recursively at build time:

- every `.mdx` file becomes a chapter; directories become tracks and modules;
- `_meta.json` supplies titles, descriptions and ordering for directories (falling back to a
  title-cased directory name);
- frontmatter supplies chapter metadata; `status` labels review state while keeping the chapter
  visible, and `draft: true` removes a file completely;
- the same tree drives the sidebar, course index, breadcrumbs, prev/next pager, sitemap and search
  index — so adding a file is the whole workflow.

**Adding a chapter:** create `content/<track>/<module>/<slug>.mdx` with frontmatter. Nothing else.

```mdx
---
title: "Generics and Type Erasure"
description: "One-sentence summary used in lists, search and metadata."   # >= 30 chars
order: 2                      # unique within the directory
difficulty: advanced          # beginner | intermediate | advanced
tags: ["generics", "erasure"]
updated: "2026-10-29"
sources:                      # required for content/java/**, warned elsewhere
  - title: "JLS §4 — Types, Values, and Variables (SE 21)"
    href: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html"
    note: "Parameterised types, wildcards and type arguments."
status: published             # draft | review | published (default)
---
```

Routes, navigation and search update automatically. A new module or track only needs a directory
with a `_meta.json` (`title`, `description`, `order`).

The full contract — schema, ordering, pager scoping, link and anchor checks, review states and the
related-notes proposal — is in [docs/authoring.md](docs/authoring.md). Per-agent constraints and the
integration checklist are in [docs/agent-briefs.md](docs/agent-briefs.md).

### MDX kit

| Component | Use |
| --- | --- |
| `<Lead>` | opening paragraph with larger muted type |
| `<Callout type="note\|tip\|warning\|danger\|java" title="…">` | asides and pitfalls |
| `<KeyPoints>` | end-of-chapter summary block |
| `<Interview question="…" level="junior\|mid\|senior">` | collapsed answer |
| `<InterviewSet title="…">` | groups questions under a heading |
| `<Diagram title="…" caption="…">` | monospace ASCII diagram in a bordered figure |
| `<Steps>` / `<Step title="…">` | numbered sequence |
| `<ShellOutput>` | terminal-styled output block |
| `<Wide>` | full-width container for tables or diagrams |

Code fences are highlighted by Shiki with a copy button, language label and dual light/dark theme.
Line highlighting works via rehype-pretty-code syntax (` ```java {3-5} `).

### Search

`getSearchIndex()` builds a static index at build time: title, description, track/module, tags,
headings and a trimmed plain-text body. The client dialog scores tokens across those fields, supports
⌘K / Ctrl+K and `/`, arrow navigation and Enter. No search service, no runtime API.

### Theming and typography

Design tokens live in `app/globals.css` as OKLCH CSS variables mapped through Tailwind v4's
`@theme inline`. Light is warm paper with an amber accent; dark is a near-black warm neutral. Article
typography (`.prose-doc`) is hand-written rather than the typography plugin, so heading rules, table
borders and code-block styling stay under direct control.

## Content status

**Advanced Core Java** is the first complete module (9 chapters, Streams pending review):

1. The Object Model and Dynamic Dispatch
2. Generics and Type Erasure
3. equals, hashCode and Records
4. Immutability, Strings and Safe Publication
5. Exceptions and Resource Management
6. Lambdas and Functional Interfaces
7. Streams and Functional Pipelines (status: draft, pending review)
8. Sealed Types and Pattern Matching
9. Reflection, Annotations and Proxies

The Java Memory Model chapter in `content/java/concurrency/` is also `status: draft`, pending the
same review. Supporting chapters exist for Collections, Concurrency, JVM, Spring Boot, PostgreSQL,
Backend Engineering, Java Fullstack, Books, Courses, Interview Questions and Quick Notes, so every
track is navigable and the engine is exercised end to end.

## Phase checklist

- [x] Blueprint: reference analysed, content model and routes defined
- [x] UI shell: responsive docs layout, sidebar, TOC, dark mode
- [x] Content engine: MDX, metadata, navigation, highlighting, search
- [x] First content: Advanced Core Java complete
- [x] Validation: typecheck, content schema/link/anchor checks, production build, static routes

## Known limitations

- Every content change needs a rebuild; there is no ISR, CMS or runtime content API.
- Search is a build-time token-scored index, not full-text search with stemming or fuzziness.
- `status` is a review label only: draft chapters stay routable and indexed. `draft: true` is the
  hard switch that removes a chapter from routes, navigation, sitemap and search.
- Related-topic navigation is ordinary Markdown links; no related-notes block is generated.
- Anchors come from Markdown headings plus `<InterviewSet>`; headings rendered by other MDX
  components have no IDs and are absent from the table of contents.
- No slug redirects, per-chapter author/series metadata, or image component beyond Markdown images
  in `public/`.
- Interactive behaviour (mobile drawer, scroll spy, search keyboard handling) is verified through
  server HTML and HTTP checks, not browser automation.

## Deliberate non-goals

No auth, database, CMS, comments, analytics or progress tracking. Content is code, reviewed like
code, and the site is a static artefact of the `content/` directory.
