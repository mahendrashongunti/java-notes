import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, PencilLine } from "lucide-react";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { DocPager } from "@/components/docs/pager";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { MobileToc, Toc } from "@/components/docs/toc";
import { Mdx } from "@/components/mdx/mdx";
import { Badge } from "@/components/ui/badge";
import {
  getAllDocs,
  getAllGroups,
  getDoc,
  getDocTrail,
  getGroupBySlug,
  getGroupDocs,
  getGroupTrail,
  getPager,
  getTracks,
  type DocMeta,
  type NavDoc,
  type NavGroup,
} from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getAllDocs().map((doc) => ({ slug: doc.slug })),
    ...getAllGroups().map((group) => ({ slug: group.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (doc) {
    return {
      title: doc.meta.title,
      description: doc.meta.description,
      alternates: { canonical: doc.meta.href },
      openGraph: {
        type: "article",
        title: doc.meta.title,
        description: doc.meta.description,
        url: doc.meta.href,
        modifiedTime: doc.meta.updated,
      },
    };
  }

  const group = getGroupBySlug(slug);
  if (group) {
    return {
      title: group.title,
      description: group.description,
      alternates: { canonical: `/learn/${group.slug.join("/")}` },
    };
  }

  return { title: "Not found" };
}

function BreadcrumbsForDoc({ doc }: { doc: DocMeta }) {
  const items: { title: string; href?: string }[] = getDocTrail(doc).map((ancestor) => ({
    title: ancestor.title,
    href: `/learn/${ancestor.slug.join("/")}`,
  }));
  items.push({ title: doc.title });
  return <Breadcrumbs items={items} />;
}

function BreadcrumbsForGroup({ group }: { group: NavGroup }) {
  const trail = getGroupTrail(group.slug);
  const items: { title: string; href?: string }[] = trail.slice(0, -1).map((ancestor) => ({
    title: ancestor.title,
    href: `/learn/${ancestor.slug.join("/")}`,
  }));
  items.push({ title: group.title });
  return <Breadcrumbs items={items} />;
}

function DocArticle({ doc }: { doc: NonNullable<ReturnType<typeof getDoc>> }) {
  const tracks = getTracks();
  const pager = getPager(doc.meta.slug);
  const updated = formatDate(doc.meta.updated);
  const editUrl = `${siteConfig.github}/blob/main/content/${doc.meta.slug.join("/")}.mdx`;

  return (
    <div className="container-page">
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_13.5rem]">
        <aside className="hidden lg:block">
          <div className="sticky top-[var(--header-h)] max-h-[calc(100vh-var(--header-h))] overflow-y-auto border-r border-border/70 py-8 pr-3 scrollbar-thin">
            <SidebarMount tracks={tracks} />
          </div>
        </aside>

        <div className="min-w-0 py-8 lg:py-10">
          <article className="max-w-[46rem]">
            <BreadcrumbsForDoc doc={doc.meta} />

            <header>
              {doc.meta.section ? (
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-accent">
                  {doc.meta.section}
                </p>
              ) : null}
              <h1 className="mt-2 text-[2rem] font-semibold leading-[1.15] tracking-[-0.028em] sm:text-[2.4rem]">
                {doc.meta.title}
              </h1>
              {doc.meta.description ? (
                <p className="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
                  {doc.meta.description}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-5 text-[0.72rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Clock3 className="size-3" /> {doc.meta.readingTime} min read
                </span>
                {updated ? <span className="font-mono">updated {updated}</span> : null}
                {doc.meta.status !== "published" ? (
                  <Badge
                    variant="outline"
                    className={
                      doc.meta.status === "draft"
                        ? "border-amber-500/40 text-amber-700 dark:text-amber-400"
                        : "border-sky-500/40 text-sky-700 dark:text-sky-400"
                    }
                  >
                    {doc.meta.status === "draft" ? "draft · pending review" : "in review"}
                  </Badge>
                ) : null}
                {doc.meta.difficulty ? (
                  <Badge variant="default" className="capitalize">
                    {doc.meta.difficulty}
                  </Badge>
                ) : null}
                {doc.meta.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[0.68rem]">
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            <MobileToc headings={doc.headings} />

            <div className="prose-doc mt-8">
              <Mdx source={doc.content} />
            </div>

            {doc.meta.sources.length > 0 ? (
              <section
                aria-label="Primary sources"
                className="mt-10 rounded-xl border border-border bg-muted/25 px-5 py-4"
              >
                <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Primary sources
                </p>
                <ul className="space-y-2.5">
                  {doc.meta.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.9rem] font-medium underline-offset-2 hover:text-accent hover:underline"
                      >
                        {source.title}
                        <span aria-hidden className="ml-1 font-mono text-[0.7rem]">
                          ↗
                        </span>
                      </a>
                      {source.note ? (
                        <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-muted-foreground">
                          {source.note}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[0.75rem] text-muted-foreground">
              <Link href={editUrl} className="inline-flex items-center gap-1.5 hover:text-accent">
                <PencilLine className="size-3.5" />
                Edit this note on GitHub
              </Link>
              <span className="font-mono">content/{doc.meta.slug.join("/")}.mdx</span>
            </div>

            <DocPager previous={pager.previous} next={pager.next} />
          </article>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-[var(--header-h)] max-h-[calc(100vh-var(--header-h))] overflow-y-auto py-10 pl-3 scrollbar-thin">
            <Toc headings={doc.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function GroupArticle({ group }: { group: NavGroup }) {
  const tracks = getTracks();
  const docs = getGroupDocs(group);
  const minutes = docs.reduce((total, doc) => total + doc.readingTime, 0);
  const sections = group.children.filter(
    (child): child is NavGroup => child.type === "group",
  );

  return (
    <div className="container-page">
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[var(--header-h)] max-h-[calc(100vh-var(--header-h))] overflow-y-auto border-r border-border/70 py-8 pr-3 scrollbar-thin">
            <SidebarMount tracks={tracks} />
          </div>
        </aside>

        <div className="min-w-0 py-8 lg:py-10">
          <div className="max-w-[46rem]">
            <BreadcrumbsForGroup group={group} />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-accent">
              {group.slug.length > 1 ? "Module" : "Track"}
            </p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.028em] sm:text-[2.4rem]">
              {group.title}
            </h1>
            {group.description ? (
              <p className="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            ) : null}
            <p className="mt-4 font-mono text-[0.72rem] text-muted-foreground">
              {docs.length} chapters · {minutes} min of reading
            </p>

            <div className="mt-10 space-y-10">
              {sections.length > 0 ? (
                sections.map((section) => {
                  const sectionDocs = getGroupDocs(section);
                  return (
                    <section key={section.slug.join("/")}>
                      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                        <h2 className="text-[1.1rem] font-semibold tracking-tight">
                          <Link
                            href={`/learn/${section.slug.join("/")}`}
                            className="hover:text-accent"
                          >
                            {section.title}
                          </Link>
                        </h2>
                        <span className="font-mono text-[0.68rem] text-muted-foreground">
                          {sectionDocs.length} chapters
                        </span>
                      </div>
                      {section.description ? (
                        <p className="mt-2 text-[0.85rem] text-muted-foreground">
                          {section.description}
                        </p>
                      ) : null}
                      <ol className="mt-3 divide-y divide-border/70">
                        {sectionDocs.map((doc) => (
                          <DocListItem key={doc.href} doc={doc} />
                        ))}
                      </ol>
                    </section>
                  );
                })
              ) : (
                <ol className="divide-y divide-border/70">
                  {docs.map((doc) => (
                    <DocListItem key={doc.href} doc={doc} />
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocListItem({ doc }: { doc: NavDoc }) {
  return (
    <li>
      <Link href={doc.href} className="group flex items-start gap-4 py-3">
        <span className="mt-0.5 font-mono text-[0.66rem] text-muted-foreground/70">
          {String(doc.order).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.92rem] font-medium group-hover:text-accent">
            {doc.title}
          </span>
          {doc.description ? (
            <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-muted-foreground">
              {doc.description}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 shrink-0 font-mono text-[0.66rem] text-muted-foreground">
          {doc.readingTime} min
        </span>
      </Link>
    </li>
  );
}

function SidebarMount({ tracks }: { tracks: NavGroup[] }) {
  return <SidebarNav tracks={tracks} />;
}

export default async function LearnSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (doc) return <DocArticle doc={doc} />;

  const group = getGroupBySlug(slug);
  if (group) return <GroupArticle group={group} />;

  notFound();
}
