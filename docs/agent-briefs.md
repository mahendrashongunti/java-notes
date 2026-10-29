# Agent briefs and integration checklist

Shared contract: [docs/authoring.md](authoring.md). Run `npm run validate` before every handoff and
`npm run check` before asking for a merge. Never rename an existing slug without coordination.

## Agent 2 — Advanced Core Java (curriculum owner)

You own the Advanced Core Java curriculum and the review of the two new drafts.

### Canonical chapter paths

| Topic | Path | Order | Status |
| --- | --- | --- | --- |
| Streams and functional pipelines | `content/java/core-java/streams-and-functional-pipelines.mdx` | 7 | `draft` |
| Java Memory Model | `content/java/concurrency/java-memory-model.mdx` | 2 | `draft` |

These exist and are live for review. **Do not create competing versions** (`streams-in-java.mdx`,
`jmm.mdx`, a second copy under another module, or a parallel page in `interview-questions` that
duplicates the explanation). Edit these files in place, or link to them.

Current order map:

- `core-java`: 1 object model, 2 generics, 3 equals/hashCode, 4 immutability, 5 exceptions,
  6 lambdas, 7 streams, 8 sealed types, 9 reflection.
- `concurrency`: 1 race conditions, 2 Java Memory Model, 3 threads/executors.

### Frontmatter you must keep

Every chapter needs `title`, `description` (≥ 30 chars), `order`, `difficulty`, `tags`, `updated`,
and `sources`. Java chapters fail validation without at least one source. Add `status: draft` while
editing; switch to `status: published` only after review.

### Source conventions

- Java SE 21 specifications: `https://docs.oracle.com/javase/specs/jls/se21/html/jls-<n>.html` and
  `.../jvms/se21/html/jvms-<n>.html`.
- JDK 21 API: `https://docs.oracle.com/en/java/javase/21/docs/api/java.base/...`.
- Dev.java: `/learn/generics/`, `/learn/api/collections-and-streams/`, `/learn/language/fp/`,
  `/learn/language/oop/`, `/learn/jvm/`, `/learn/api/reflection-method-handles/`.
- Put the section number in the source title; avoid deep URL fragments.
- One sentence per `note`, explaining what the source supports.
- Do not copy specification or book prose. Paraphrase and attribute; mark anything not verified
  against a specification or a compiler run as an assumption.

### Content-specific constraints

- Code examples must compile with `javac --release 21`. The existing Streams and JMM examples were
  executed on Temurin 21.0.13; keep them that way when editing.
- Use `<Diagram>` for ASCII diagrams, tables for comparisons, `<KeyPoints>` for revision,
  `<InterviewSet>` for questions (one per chapter — two produce duplicate `#interview-questions`).
- Do not introduce new MDX components; the kit is fixed.
- Keep the pager sequence intact; reordering is a frontmatter-only change to `order`.
- The chapter's `sources` are rendered automatically; do not add a manual references section.

### Review checklist for the two drafts

1. Technical claims match the JLS/JVMS/API behaviour for Java 21.
2. Every code block compiles; outputs match execution.
3. `sources` support the specific claims, not just the topic.
4. Interview answers are correct and the follow-up implied by the answer is defensible.
5. Ordering in `core-java` and `concurrency` is pedagogically sound.
6. `npm run check` passes, then set `status: published`.

## Agent 1 — Effective Java notes

Allowed paths: `content/books/**`. No application changes are needed.

Existing file: `content/books/effective-java-reading-notes.mdx` (order 1, single overview chapter).
You own it and may expand it in place or split it.

Two compatible layouts:

- **Flat siblings** — `content/books/effective-java-item-3.mdx`, each with a unique `order`.
- **Module** — `content/books/effective-java/_meta.json` plus chapters inside, ordered within the
  module. The `books` track then shows the module as a section.

Both work today. The module layout is better once there are more than a handful of item notes.

Frontmatter constraints: the standard schema applies. `sources` is warned, not required, outside
`content/java/**`; cite the edition page
(`https://www.informit.com/store/effective-java-3rd-edition-9780134685991`) and the relevant JLS
chapter where a rule is normative. Set `status: draft` until reviewed.

Schema notes: there is no `book`, `item` or `series` field — unknown keys are ignored. Encode the
item number in `title` and use tags such as `["effective-java", "item-17"]`. Do not duplicate
canonical Core Java chapters; link to them instead.

## Agent 3 — Spring chapters

Allowed paths: `content/spring-boot/**`. No application changes are needed.

Existing canonical chapter: `content/spring-boot/request-lifecycle.mdx` (order 1). Coordinate
before editing it; prefer adding new chapters with higher orders or new modules.

- Flat chapters: `content/spring-boot/<slug>.mdx` with unique `order` values.
- Module: `content/spring-boot/web/_meta.json` plus chapters, if the track grows past a few pages.

Sources: Spring Framework reference (`https://docs.spring.io/spring-framework/reference/...`),
Spring Boot reference (`https://docs.spring.io/spring-boot/reference/`), Jakarta Servlet
specification (`https://jakarta.ee/specifications/servlet/6.0/`). Link specific pages rather than
homepages. `sources` warns outside `content/java/**` but is expected for technical chapters.

Set `status: draft` while writing. Use the existing MDX kit for callouts, tables, diagrams and
interview questions; no UI work is required.

## Schema constraints that surprise new agents

- `description` must be at least 30 characters; `_meta.json` descriptions at least 20.
- `order` must be unique within a directory; duplicates fail validation.
- File names must be kebab-case.
- `draft: true` removes a chapter from routes, navigation, sitemap and search. `status` only labels
  it.
- `sources` is an error for `content/java/**`, a warning elsewhere; `href` must be HTTPS.
- At most one `<InterviewSet>` per chapter.
- Frontmatter is not rendered except for known fields; unknown keys are silently ignored.

## Integration checklist

1. File lives under the owning track; slug is kebab-case and does not collide.
2. The directory has `_meta.json`; sibling `order` values are unique.
3. Frontmatter has all required keys and a unique chapter `order`.
4. `sources` are HTTPS, specific, and support the claims.
5. Internal links are absolute `/learn/...` paths and anchors resolve.
6. The chapter does not duplicate an existing canonical topic; it links to it.
7. `status` reflects reality (`draft` until reviewed).
8. No application, component or stylesheet changes are included.
9. `npm run validate` and `npm run check` pass locally.
10. Handoff notes name the chapter paths and the review state.
