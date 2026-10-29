import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllDocs, getStats, getTracks, type NavDoc, type NavGroup } from "@/lib/content";

export const metadata: Metadata = {
  title: "The course",
  description:
    "A structured path through advanced Core Java, collections, concurrency, the JVM, Spring Boot, PostgreSQL and backend engineering.",
};

function docCount(group: NavGroup): number {
  return group.children.reduce(
    (total, child) => total + (child.type === "doc" ? 1 : docCount(child)),
    0,
  );
}

function DocList({ docs }: { docs: NavDoc[] }) {
  return (
    <ul className="divide-y divide-border/70">
      {docs.map((doc) => (
        <li key={doc.href}>
          <Link href={doc.href} className="group flex items-start gap-4 py-2.5">
            <span className="mt-0.5 font-mono text-[0.66rem] text-muted-foreground/70">
              {String(doc.order).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[0.88rem] font-medium group-hover:text-accent">
                  {doc.title}
                </span>
                {doc.difficulty === "advanced" ? (
                  <Badge variant="muted">advanced</Badge>
                ) : null}
              </span>
              {doc.description ? (
                <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-muted-foreground">
                  {doc.description}
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 hidden shrink-0 items-center gap-1 font-mono text-[0.66rem] text-muted-foreground sm:flex">
              <Clock3 className="size-3" />
              {doc.readingTime}m
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LearnPage() {
  const tracks = getTracks();
  const stats = getStats();
  const totalDocs = getAllDocs().length;

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">
          The course
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-[2.75rem]">
          A field guide to Java, from dispatch to the JVM.
        </h1>
        <p className="mt-4 text-[0.97rem] leading-relaxed text-muted-foreground">
          Read it front to back, or jump straight to the mechanism you are debugging. Each chapter
          has a deep explanation, runnable code, a compact revision block and the interview
          questions that follow from the material.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-[0.75rem] text-muted-foreground">
          <span>
            <span className="font-mono text-foreground">{totalDocs}</span> chapters
          </span>
          <span>
            <span className="font-mono text-foreground">{stats.sections}</span> modules
          </span>
          <span>
            <span className="font-mono text-foreground">{stats.minutes}</span> minutes
          </span>
          <span className="font-mono">updated continuously</span>
        </div>
      </div>

      <div className="mt-14 space-y-16">
        {tracks.map((track, trackIndex) => (
          <section key={track.slug.join("/")} id={track.slug.join("-")} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[0.72rem] text-accent">
                  {String(trackIndex + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[1.5rem] font-semibold tracking-tight">{track.title}</h2>
                <span className="font-mono text-[0.7rem] text-muted-foreground">
                  {docCount(track)} chapters
                </span>
              </div>
              {track.description ? (
                <p className="max-w-md text-[0.82rem] leading-relaxed text-muted-foreground">
                  {track.description}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-x-10 gap-y-8 lg:grid-cols-2">
              {track.children.map((child) =>
                child.type === "group" ? (
                  <div key={child.slug.join("/")}>
                    <Link
                      href={`/learn/${child.slug.join("/")}`}
                      className="group flex items-center justify-between gap-2"
                    >
                      <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground group-hover:text-accent">
                        {child.title}
                      </h3>
                      <ArrowUpRight className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <div className="mt-1.5">
                      <DocList
                        docs={child.children.filter((item): item is NavDoc => item.type === "doc")}
                      />
                    </div>
                  </div>
                ) : (
                  <DocList key={child.href} docs={[child]} />
                ),
              )}
            </div>
          </section>
        ))}

        {tracks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No content yet. Add an MDX file under{" "}
              <code className="font-mono text-accent">content/</code> to get started.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
