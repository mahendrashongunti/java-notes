# Content authoring and integration contract

This is the canonical description of how content is structured on this site. It is written so a
content agent can add chapters without touching application code.

Authoritative implementations:

| Concern | File |
| --- | --- |
| Content index, routes, ordering, pager, breadcrumbs, search index | `lib/content.ts` |
| Schema, link, anchor and review-state checks | `scripts/validate-content.mjs` |
| Chapter rendering, sources block, status badge | `app/learn/[...slug]/page.tsx` |
| Sidebar, TOC, breadcrumbs, pager | `components/docs/*` |

`content/` is the database. At build time `lib/content.ts` walks it once and produces a single
navigation tree. The sidebar, course index, track and module pages, breadcrumbs, previous/next
pager, sitemap, search index and metadata all read that same tree. Adding an MDX file is the entire
publishing workflow.

## 1. Directory model

```
content/
├── java/                        track (depth 1)
│   ├── _meta.json               track title, description, order
│   ├── core-java/               module (depth 2)
│   │   ├── _meta.json           module title, description, order
│   │   └── generics-and-type-erasure.mdx
│   └── concurrency/             another module
├── spring-boot/                 track
│   └── request-lifecycle.mdx    chapter directly in the track
└── books/
```

- Every `.mdx` file is a chapter.
- Every directory is a group: depth 1 is a **track**, depth 2 and deeper are **modules**.
- Every directory that contains content needs `_meta.json`; the `content/` root is exempt.
- URLs are derived from the path: `content/java/core-java/generics-and-type-erasure.mdx` →
  `/learn/java/core-java/generics-and-type-erasure`.
- File names must be kebab-case. Renaming a slug changes the URL; there is no redirect layer, so
  coordinate before renaming anything that has been shared.

`_meta.json`:

```json
{
  "title": "Advanced Core Java",
  "description": "What this module covers, in one sentence of at least 20 characters.",
  "order": 1
}
```

`title` is required, `description` must be at least 20 characters, `order` must be a positive
integer and must be unique among sibling directories.

## 2. Chapter frontmatter

```mdx
---
title: "Generics and Type Erasure"
description: "Why List<String> is not a List<Object>, how wildcards encode direction, and what survives compilation."
order: 2
difficulty: advanced
tags: ["generics", "erasure", "wildcards"]
updated: "2026-10-29"
sources:
  - title: "JLS §4 — Types, Values, and Variables (SE 21)"
    href: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html"
    note: "Parameterised types, wildcards and type arguments."
status: published
---
```

| Key | Required | Rules |
| --- | --- | --- |
| `title` | yes | Non-empty string; shown in nav, lists and `<title>` |
| `description` | yes | At least 30 characters; used in lists, search and metadata |
| `order` | yes | Positive integer, unique within its directory |
| `difficulty` | yes | `beginner`, `intermediate` or `advanced` |
| `tags` | yes | Non-empty array of strings |
| `updated` | yes | ISO date `YYYY-MM-DD` |
| `sources` | required for `content/java/**`, warned elsewhere | Non-empty array of `{ title, href, note? }`; `href` must be HTTPS; no duplicate hrefs |
| `status` | no | `draft`, `review` or `published`; defaults to `published` |
| `draft` | no | Boolean. `true` removes the chapter from the site entirely (see §6) |

Unknown frontmatter keys are ignored, not rendered and not rejected. There is no `author`,
`series`, `book` or `item` field; model those with `title`, `description` and `tags`.

## 3. Ordering and navigation

- Groups and chapters sort by `order`, then by title. Duplicate `order` values are a hard error.
- A group page lists every descendant chapter in order, grouped by nested module when present.
- Previous/next is scoped to the **closest ancestor module that contains more than one chapter**.
  The pager never crosses from one module or track into another; the first and last chapter of a
  module show only one neighbour. Reordering is therefore a frontmatter-only change.
- Breadcrumbs are built from the ancestor chain, so they always show directory titles, not raw
  folder names.
- The sidebar opens the active track and module automatically, marks the current chapter with
  `aria-current="page"`, and scrolls it into view.
- The table of contents is generated from `##` and `###` headings. Heading IDs use
  `github-slugger` over **every** heading level, so duplicate suffixes (`-1`, `-2`) stay in sync with
  the ids that `rehype-slug` writes into the HTML. `####` and deeper get IDs but are not listed in
  the TOC.
- `<InterviewSet>` renders the anchored heading `#interview-questions` and is appended to the TOC
  when used. Use at most one per chapter.

## 4. Source references

Sources live in frontmatter, not in the body, so they can be validated uniformly. They render as a
**Primary sources** block after the chapter body and before the edit link and pager.

Conventions for Java chapters:

- Prefer the Java SE 21 specifications (JLS, JVMS), the JDK 21 API documentation, and Dev.java.
- Link a specific chapter or class page rather than a homepage.
- Put the section number in the title, not in a fragile URL fragment.
- Keep `note` to one sentence explaining what the source supports.
- HTTPS only; one entry per URL.

The validator checks shape and URL scheme but does **not** fetch external URLs, so link rot and
wrong-but-live pages still need a human pass.

## 5. Internal links and anchors

- Use absolute internal paths: `[HashMap internals](/learn/java/collections/hashmap-internals)`.
- `#anchor` links are checked against the target chapter's heading IDs and against
  `interview-questions` where an `<InterviewSet>` exists.
- The validator resolves `/learn/...` paths against the routes generated from the content tree, so a
  link to a chapter that does not exist fails the build check.
- Relative links and trailing slashes produce warnings; external `http://` links warn.
- External URLs must be HTTPS to pass without a warning.

## 6. Draft and review states

Two independent switches, with different jobs:

| State | Visible in nav, routes, sitemap and search | Rendering |
| --- | --- | --- |
| `draft: true` | No — excluded from the tree entirely | none (file is still validated) |
| `status: draft` | Yes | amber badge `draft · pending review` |
| `status: review` | Yes | blue badge `in review` |
| `status: published` (default) | Yes | no badge |

Intended workflow:

1. Author creates the chapter with `status: draft`.
2. Reviewer reads it, fixes or requests changes, then sets `status: review` or `status: published`.
3. To withdraw a chapter from the site entirely, set `draft: true` — do not delete it.

`status` is a label, not access control: draft chapters are still routable, indexed and returned by
search. Only `draft: true` removes them. Hidden files are still validated, so schema and link checks
run before a chapter is re-published.

## 7. Canonical chapters and related notes

Each concept has exactly one canonical chapter. Other chapters link to it with a normal markdown
link; they do not restate it or create a second version under a different track. Quick notes and
interview banks may summarise, but must link back to the canonical chapter.

Related-note links currently use ordinary markdown links, which the validator already checks. A
dedicated cross-track metadata field is **proposed but not implemented** (see §10).

## 8. Adding content without application code

1. Pick the track and module. If they exist, no directory work is needed.
2. New directory? Add `_meta.json` with `title`, `description`, `order`; the parent needs nothing.
3. Create `content/<path>/<kebab-slug>.mdx` with the frontmatter above.
4. Write Markdown with the existing MDX kit (`Lead`, `Callout`, `KeyPoints`, `Interview`,
   `InterviewSet`, `Diagram`, `Steps`, `Step`, `ShellOutput`, `Wide`, `RevisionNote`).
5. Set `status: draft` until reviewed.
6. Run `npm run validate`, then `npm run check` before handoff.

What each change requires:

| Change | Touch |
| --- | --- |
| New chapter in an existing module | one `.mdx` file |
| New module | directory + `_meta.json` + chapters |
| New track | directory + `_meta.json` + module or chapters |
| New source | `sources` frontmatter |
| Review state | `status` (or `draft: true`) |
| Navigation, pager, search, sitemap | nothing — derived |

## 9. Validation and commands

```bash
npm run validate        # schema, ordering, links, anchors, review states
npm run validate:strict # also treats missing summary/interview/sources warnings as errors
npm run typecheck       # tsc --noEmit
npm run build           # production build, every route prerendered
npm run check           # typecheck + validate + build
```

The validator reports errors (exit 1) separately from warnings. What it does not check: external
URLs, rendered MDX output, client-side interactions, or whether two chapters cover the same topic.

## 10. Related-notes proposal (not implemented)

Metadata shape, if this is adopted later:

```yaml
related:
  - slug: java/collections/hashmap-internals
    why: "Why the equals/hashCode contract decides bucket lookup."
  - slug: java/concurrency/java-memory-model
    why: "Safe publication of immutable values."
```

Proposed validation rules:

- `slug` resolves to an existing chapter; paths are content-relative (no `/learn` prefix).
- No self-reference, no duplicates, 1–4 entries.
- Targets must be `status: published`, so drafts are not advertised.
- Cross-track links are allowed; canonical ownership does not move.
- Rendering goes after the sources block and before the pager; the pager chain is unchanged.

It is not implemented because it needs a parser, a renderer and validator rules; today ordinary
markdown links already work and are checked.

## 11. Known limitations

- Content changes require a rebuild; there is no ISR, CMS or runtime content API.
- Search is a build-time index with token scoring, not stemming or fuzzy matching.
- `status` does not affect routes, sitemap or search; only `draft: true` removes content.
- Heading anchors come from Markdown headings plus `<InterviewSet>`. Headings rendered inside other
  MDX components have no IDs and do not appear in the TOC.
- The article header's module label reflects depth 2 only; breadcrumbs and the sidebar handle
  arbitrary depth.
- No slug redirects, no per-chapter author or series metadata, no generated related-notes block, no
  image component beyond Markdown images served from `public/`.
- Interactive behaviour (mobile drawer, scroll spy, keyboard search) is verified through server HTML
  and HTTP checks during development, not browser automation.
