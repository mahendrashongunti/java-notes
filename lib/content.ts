import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { titleize } from "@/lib/utils";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Review state of a chapter. `draft` and `review` chapters stay routable and visible with a label;
 * the separate `draft: true` flag is the hard "do not publish" switch.
 */
export type DocStatus = "draft" | "review" | "published";

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type SourceRef = {
  title: string;
  href: string;
  note?: string;
};

export type DocMeta = {
  slug: string[];
  href: string;
  title: string;
  description: string;
  order: number;
  tags: string[];
  sources: SourceRef[];
  status: DocStatus;
  updated?: string;
  difficulty?: Difficulty;
  readingTime: number;
  /** Title of the top-level track, e.g. "Java". */
  track: string;
  trackSlug: string;
  /** Title of the nested module, e.g. "Advanced Core Java". */
  section?: string;
  sectionSlug?: string;
};

export type NavDoc = DocMeta & { type: "doc" };

export type NavGroup = {
  type: "group";
  title: string;
  description?: string;
  slug: string[];
  order: number;
  children: NavItem[];
};

export type NavItem = NavDoc | NavGroup;

type DirMeta = {
  title?: string;
  description?: string;
  order?: number;
};

type DocContext = {
  track: string;
  trackSlug: string;
  section?: string;
  sectionSlug?: string;
};

const docHref = (slug: string[]) => `/learn/${slug.join("/")}`;

function readDirMeta(dir: string): DirMeta {
  const file = path.join(dir, "_meta.json");
  if (!fs.existsSync(file)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as DirMeta;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function countWords(source: string) {
  const words = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 210));
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string" && value.length > 0) {
    return value.split(",").map((item) => item.trim());
  }
  return [];
}

function asSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { title, href, note } = entry as Record<string, unknown>;
    if (typeof title !== "string" || typeof href !== "string") return [];
    return [{ title, href, note: typeof note === "string" ? note : undefined }];
  });
}

function asStatus(value: unknown): DocStatus {
  return value === "draft" || value === "review" ? value : "published";
}

function asDifficulty(value: unknown): Difficulty | undefined {
  return value === "beginner" || value === "intermediate" || value === "advanced"
    ? value
    : undefined;
}

export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const withoutCode = source
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");

  const headings: Heading[] = [];
  for (const line of withoutCode.split("\n")) {
    // Slug every level so duplicate suffixes match rehype-slug exactly; only h2/h3 reach the TOC.
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_~]/g, "")
      .trim();

    if (!text) continue;
    const id = slugger.slug(text);
    const level = match[1].length;
    if (level !== 2 && level !== 3) continue;

    headings.push({ id, text, level });
  }

  return headings;
}

function walk(dir: string, slug: string[], context: DocContext): NavItem[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items: NavItem[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      const childSlug = [...slug, entry.name];
      const meta = readDirMeta(path.join(dir, entry.name));
      const isTrack = slug.length === 0;
      const isSection = slug.length === 1;

      const children = walk(path.join(dir, entry.name), childSlug, {
        track: isTrack ? (meta.title ?? titleize(entry.name)) : context.track,
        trackSlug: isTrack ? entry.name : context.trackSlug,
        section: isSection ? (meta.title ?? titleize(entry.name)) : context.section,
        sectionSlug: isSection ? entry.name : context.sectionSlug,
      });

      if (children.length === 0) continue;

      items.push({
        type: "group",
        title: meta.title ?? titleize(entry.name),
        description: meta.description,
        slug: childSlug,
        order: meta.order ?? 500,
        children,
      });
      continue;
    }

    if (!entry.isDirectory() && entry.name.endsWith(".mdx")) {
      const filePath = path.join(dir, entry.name);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      if (data.draft === true) continue;

      const name = entry.name.replace(/\.mdx$/, "");
      const docSlug = [...slug, name];
      const title = typeof data.title === "string" ? data.title : titleize(name);
      const order = typeof data.order === "number" ? data.order : 500;

      items.push({
        type: "doc",
        slug: docSlug,
        href: docHref(docSlug),
        title,
        description: typeof data.description === "string" ? data.description : "",
        order,
        tags: asStringArray(data.tags),
        sources: asSources(data.sources),
        status: asStatus(data.status),
        updated: typeof data.updated === "string" ? data.updated : undefined,
        difficulty: asDifficulty(data.difficulty),
        readingTime: countWords(content),
        track: context.track || titleize(slug[0] ?? "Notes"),
        trackSlug: context.trackSlug || (slug[0] ?? "notes"),
        section: context.section,
        sectionSlug: context.sectionSlug,
      });
    }
  }

  return items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

const buildNav = cache((): NavItem[] => walk(CONTENT_ROOT, [], { track: "", trackSlug: "" }));

export function getNav(): NavItem[] {
  return buildNav();
}

function flatten(items: NavItem[]): NavDoc[] {
  return items.flatMap((item) => (item.type === "doc" ? [item] : flatten(item.children)));
}

export const getAllDocs = cache((): NavDoc[] => flatten(getNav()));

export const getTracks = cache((): NavGroup[] =>
  getNav().filter((item): item is NavGroup => item.type === "group"),
);

export const getAllGroups = cache((): NavGroup[] => {
  const groups: NavGroup[] = [];
  const visit = (items: NavItem[]) => {
    for (const item of items) {
      if (item.type === "group") {
        groups.push(item);
        visit(item.children);
      }
    }
  };
  visit(getNav());
  return groups;
});

export function getGroupBySlug(slug: string[]): NavGroup | undefined {
  return getAllGroups().find((group) => group.slug.join("/") === slug.join("/"));
}

export function getGroupDocs(group: NavGroup): NavDoc[] {
  return flatten(group.children);
}

export function getDocBySlug(slug: string[]): NavDoc | undefined {
  return getAllDocs().find((doc) => doc.slug.join("/") === slug.join("/"));
}

/**
 * Ancestor groups for a group slug, outermost first. Used by breadcrumbs and the sidebar so
 * titles come from the navigation tree instead of raw directory names.
 */
export function getGroupTrail(slug: string[]): NavGroup[] {
  const trail: NavGroup[] = [];
  let items: NavItem[] = getNav();

  for (let depth = 1; depth <= slug.length; depth += 1) {
    const key = slug.slice(0, depth).join("/");
    const group = items.find(
      (item): item is NavGroup => item.type === "group" && item.slug.join("/") === key,
    );
    if (!group) break;
    trail.push(group);
    items = group.children;
  }

  return trail;
}

export function getDocTrail(doc: Pick<DocMeta, "slug">): NavGroup[] {
  return getGroupTrail(doc.slug.slice(0, -1));
}

/**
 * Previous/next stay inside the closest ancestor module, so the pager never jumps from the end of
 * one track into the start of another.
 */
export function getPager(slug: string[]) {
  const doc = getDocBySlug(slug);
  if (!doc) return { previous: null, next: null };

  const trail = getDocTrail(doc);
  const module = [...trail].reverse().find((group) => getGroupDocs(group).length > 1);
  const scope = module ? getGroupDocs(module) : [doc];
  const index = scope.findIndex((item) => item.href === doc.href);

  return {
    previous: index > 0 ? scope[index - 1] : null,
    next: index >= 0 && index < scope.length - 1 ? scope[index + 1] : null,
  };
}

export type LoadedDoc = {
  meta: DocMeta;
  content: string;
  headings: Heading[];
};

export const getDoc = cache((slug: string[]): LoadedDoc | null => {
  const meta = getDocBySlug(slug);
  if (!meta) return null;

  const filePath = path.join(CONTENT_ROOT, ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);
  const headings = extractHeadings(content);

  // Interview sets render their own h2; keep it in the table of contents instead of hiding a
  // whole section from the reader's navigation.
  if (/<InterviewSet\b/.test(content) && !headings.some((heading) => heading.id === "interview-questions")) {
    const customTitle = /<InterviewSet[^>]*\btitle="([^"]+)"/.exec(content)?.[1];
    headings.push({
      id: "interview-questions",
      text: customTitle ?? "Interview questions",
      level: 2,
    });
  }

  return { meta, content, headings };
});

export function getSectionDocs(trackSlug: string, sectionSlug: string): NavDoc[] {
  return getAllDocs().filter(
    (doc) => doc.trackSlug === trackSlug && doc.sectionSlug === sectionSlug,
  );
}

function plainText(source: string) {
  return source
    .replace(/^---[\s\S]*?---/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  track: string;
  section?: string;
  tags: string[];
  headings: string[];
  text: string;
};

export const getSearchIndex = cache((): SearchEntry[] =>
  getAllDocs().map((doc) => {
    const filePath = path.join(CONTENT_ROOT, ...doc.slug) + ".mdx";
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
    const { content } = matter(raw);

    return {
      title: doc.title,
      description: doc.description,
      href: doc.href,
      track: doc.track,
      section: doc.section,
      tags: doc.tags,
      headings: extractHeadings(content).map((heading) => heading.text),
      text: plainText(content).slice(0, 2400),
    };
  }),
);

export function getStats() {
  const docs = getAllDocs();
  const sections = getTracks().reduce(
    (total, track) =>
      total + track.children.filter((child) => child.type === "group").length,
    0,
  );

  return {
    docs: docs.length,
    sections,
    tracks: getTracks().length,
    minutes: docs.reduce((total, doc) => total + doc.readingTime, 0),
  };
}
