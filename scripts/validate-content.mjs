#!/usr/bin/env node
/**
 * Validates the MDX content layer: frontmatter, directory metadata, ordering, heading anchors and
 * every internal link. Exits non-zero on errors so CI and `npm run check` fail loudly.
 *
 * Usage: node scripts/validate-content.mjs [--strict]
 *   --strict turns content-quality warnings (missing sources, revision, interview set) into errors.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const ROOT = path.join(process.cwd(), "content");
const STRICT = process.argv.includes("--strict");
const errors = [];
const warnings = [];

const error = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const display = (file) => path.relative(process.cwd(), file);

const HREF = (slug) => `/learn/${slug.join("/")}`;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const STATUSES = new Set(["draft", "review", "published"]);

if (!fs.existsSync(ROOT)) {
  console.error("content/ directory is missing");
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Heading extraction (must mirror rehype-slug + lib/content.ts)       */
/* ------------------------------------------------------------------ */

function extractHeadingIds(body) {
  const slugger = new GithubSlugger();
  const source = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");

  const ids = [];
  for (const line of source.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[*_~]/g, "")
      .trim();
    if (!text) continue;

    ids.push({ id: slugger.slug(text), level: match[1].length, text });
  }
  return ids;
}

/* ------------------------------------------------------------------ */
/* Walk the content tree                                               */
/* ------------------------------------------------------------------ */

const groups = []; // { slug, dir, meta }
const docs = []; // { slug, file, data, body, headings }

function walk(dir, slug) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"));

  const metaFile = path.join(dir, "_meta.json");
  let meta = null;
  if (fs.existsSync(metaFile)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    } catch (cause) {
      error(`${display(metaFile)}: invalid JSON (${cause.message})`);
    }
  } else if (slug.length > 0 && (files.length > 0 || dirs.length > 0)) {
    error(`${display(metaFile)}: missing directory metadata`);
  }

  if (meta) {
    if (typeof meta.title !== "string" || meta.title.trim().length === 0) {
      error(`${display(metaFile)}: "title" is required`);
    }
    if (typeof meta.description !== "string" || meta.description.trim().length < 20) {
      error(`${display(metaFile)}: "description" must be at least 20 characters`);
    }
    if (!Number.isInteger(meta.order) || meta.order < 1) {
      error(`${display(metaFile)}: "order" must be a positive integer`);
    }
  }

  groups.push({ slug, dir, meta });

  const seenOrders = new Map();
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    const name = file.name.replace(/\.mdx$/, "");
    const docSlug = [...slug, name];
    const raw = fs.readFileSync(filePath, "utf8");

    if (!KEBAB.test(name)) {
      error(`${display(filePath)}: filename must be kebab-case`);
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (cause) {
      error(`${display(filePath)}: invalid frontmatter (${cause.message})`);
      continue;
    }

    const data = parsed.data ?? {};
    const where = display(filePath);

    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      error(`${where}: "title" is required`);
    }
    if (typeof data.description !== "string" || data.description.trim().length < 30) {
      error(`${where}: "description" must be at least 30 characters`);
    }
    if (!Number.isInteger(data.order) || data.order < 1) {
      error(`${where}: "order" must be a positive integer`);
    } else if (seenOrders.has(data.order)) {
      error(`${where}: order ${data.order} is already used by ${seenOrders.get(data.order)}`);
    } else {
      seenOrders.set(data.order, file.name);
    }
    if (!DIFFICULTIES.has(data.difficulty)) {
      error(`${where}: "difficulty" must be beginner, intermediate or advanced`);
    }
    if (data.status !== undefined && !STATUSES.has(data.status)) {
      error(`${where}: "status" must be draft, review or published`);
    }
    if (data.draft !== undefined && typeof data.draft !== "boolean") {
      error(`${where}: "draft" must be a boolean when present`);
    }
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      error(`${where}: "tags" must be a non-empty array`);
    }
    if (typeof data.updated !== "string" || !DATE.test(data.updated)) {
      error(`${where}: "updated" must be an ISO date (YYYY-MM-DD)`);
    } else if (Number.isNaN(Date.parse(data.updated))) {
      error(`${where}: "updated" is not a real date`);
    }

    const headings = extractHeadingIds(parsed.content);
    const duplicateIds = headings
      .map((heading) => heading.id)
      .filter((id, index, list) => list.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      error(`${where}: duplicate heading ids: ${[...new Set(duplicateIds)].join(", ")}`);
    }

    docs.push({ slug: docSlug, file: filePath, data, body: parsed.content, headings });
  }

  for (const child of dirs) {
    if (child.name.startsWith(".")) continue;
    walk(path.join(dir, child.name), [...slug, child.name]);
  }
}

walk(ROOT, []);

/* ------------------------------------------------------------------ */
/* Tree-level checks                                                   */
/* ------------------------------------------------------------------ */

// Directory order must be unique among siblings, or navigation order is ambiguous.
const siblingOrders = new Map();
for (const group of groups) {
  if (!group.meta || !Number.isInteger(group.meta.order)) continue;
  const parent = group.slug.slice(0, -1).join("/");
  const key = `${parent}::${group.meta.order}`;
  const label = display(path.join(group.dir, "_meta.json"));
  if (siblingOrders.has(key)) {
    error(`${label}: order ${group.meta.order} is already used by ${siblingOrders.get(key)}`);
  } else {
    siblingOrders.set(key, label);
  }
}

const routeSet = new Set(["/", "/learn"]);
for (const doc of docs) routeSet.add(HREF(doc.slug));
for (const group of groups) {
  if (group.slug.length > 0) routeSet.add(HREF(group.slug));
}

const anchorsByRoute = new Map();
for (const doc of docs) {
  anchorsByRoute.set(HREF(doc.slug), new Set(doc.headings.map((heading) => heading.id)));
  // InterviewSet renders its own anchored h2.
  if (/<InterviewSet\b/.test(doc.body)) anchorsByRoute.get(HREF(doc.slug)).add("interview-questions");
}

const seenTitles = new Map();
for (const doc of docs) {
  const title = doc.data.title;
  if (typeof title !== "string") continue;
  if (seenTitles.has(title)) {
    warn(`${display(doc.file)}: duplicate title "${title}" (also ${seenTitles.get(title)})`);
  } else {
    seenTitles.set(title, display(doc.file));
  }

  if (/<InterviewSet\b/g.test(doc.body) && (doc.body.match(/<InterviewSet\b/g) ?? []).length > 1) {
    error(`${display(doc.file)}: more than one <InterviewSet> produces duplicate #interview-questions ids`);
  }

  const isJava = doc.slug[0] === "java";
  const sources = doc.data.sources;

  if (sources !== undefined) {
    if (!Array.isArray(sources) || sources.length === 0) {
      error(`${display(doc.file)}: "sources" must be a non-empty list`);
    } else {
      const seenHrefs = new Set();
      sources.forEach((source, index) => {
        const label = `${display(doc.file)}: sources[${index}]`;
        if (!source || typeof source !== "object") {
          error(`${label} must be an object with title and href`);
          return;
        }
        if (typeof source.title !== "string" || source.title.trim().length < 5) {
          error(`${label}.title is required`);
        }
        if (typeof source.href !== "string" || !/^https:\/\//.test(source.href)) {
          error(`${label}.href must be an https URL`);
        } else if (seenHrefs.has(source.href)) {
          error(`${label}.href duplicates an earlier source`);
        } else {
          seenHrefs.add(source.href);
        }
        if (source.note !== undefined && typeof source.note !== "string") {
          error(`${label}.note must be a string when present`);
        }
      });
    }
  } else if (isJava) {
    error(`${display(doc.file)}: Java chapters require frontmatter "sources"`);
  } else {
    warn(`${display(doc.file)}: no frontmatter "sources"`);
  }

  if (isJava) {
    const quality = [];
    if (!/<KeyPoints\b/.test(doc.body) && !/<RevisionNote\b/.test(doc.body)) {
      quality.push("no <KeyPoints> or <RevisionNote>");
    }
    if (!/<InterviewSet\b/.test(doc.body)) quality.push("no interview questions");
    for (const issue of quality) {
      if (STRICT) error(`${display(doc.file)}: ${issue}`);
      else warn(`${display(doc.file)}: ${issue}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Link checks                                                         */
/* ------------------------------------------------------------------ */

const MD_LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const JSX_HREF = /href="([^"]+)"/g;

function checkLink(rawHref, doc) {
  const href = rawHref.trim();

  if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

  if (/^https?:\/\//.test(href)) {
    if (href.startsWith("http://")) {
      warn(`${display(doc.file)}: insecure external link ${href}`);
    }
    return;
  }

  if (href.startsWith("#")) {
    const id = decodeURIComponent(href.slice(1));
    if (!anchorsByRoute.get(HREF(doc.slug))?.has(id)) {
      error(`${display(doc.file)}: missing anchor ${href} in this document`);
    }
    return;
  }

  if (!href.startsWith("/")) {
    warn(`${display(doc.file)}: relative link "${href}" — use an absolute /learn/... path`);
    return;
  }

  const [rawPath, rawAnchor] = href.split("#");
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/$/, "") : rawPath;

  if (rawPath !== pathname) {
    warn(`${display(doc.file)}: trailing slash in ${href}`);
  }

  if (!routeSet.has(pathname)) {
    error(`${display(doc.file)}: broken internal link ${href}`);
    return;
  }

  if (rawAnchor) {
    const id = decodeURIComponent(rawAnchor);
    if (!anchorsByRoute.get(pathname)?.has(id)) {
      error(`${display(doc.file)}: missing anchor #${id} on ${pathname}`);
    }
  }
}

for (const doc of docs) {
  const links = new Set();
  for (const pattern of [MD_LINK, JSX_HREF]) {
    for (const match of doc.body.matchAll(pattern)) {
      links.add(match[1]);
    }
  }
  for (const link of links) checkLink(link, doc);
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

const modules = groups.filter((group) => group.slug.length > 1).length;
const tracks = groups.filter((group) => group.slug.length === 1).length;

const hidden = docs.filter((doc) => doc.data.draft === true).length;
const drafts = docs.filter((doc) => doc.data.status === "draft").length;
const inReview = docs.filter((doc) => doc.data.status === "review").length;

console.log(
  `content: ${docs.length} chapters · ${modules} modules · ${tracks} tracks · ${groups.length} navigation nodes`,
);
console.log(
  `review state: ${drafts} draft · ${inReview} in review · ${hidden} hidden via draft:true`,
);

for (const warning of warnings) console.warn(`warn  ${warning}`);
for (const problem of errors) console.error(`error ${problem}`);

if (warnings.length > 0) console.log(`\n${warnings.length} warning(s)`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s) — content validation failed`);
  process.exit(1);
}

console.log("content validation passed");
