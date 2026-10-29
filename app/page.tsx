import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllDocs, getStats, getTracks, type NavDoc, type NavGroup } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const featuredSlugs = [
  "java/core-java/object-model-and-polymorphism",
  "java/core-java/generics-and-type-erasure",
  "java/concurrency/race-conditions-and-locks",
];

function heroCode() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-mono text-[0.7rem] text-muted-foreground">
          Shapes.java — Java 21+
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.76rem] leading-[1.75] sm:text-[0.8rem]">
        <code>
          <span className="text-muted-foreground">// exhaustive, no visitor, no default</span>
          {"\n"}
          <span className="text-accent">sealed interface</span> Shape{" "}
          <span className="text-accent">permits</span> Circle, Square {"{}"}
          {"\n"}
          <span className="text-accent">record</span> Circle(<span className="text-sky-600 dark:text-sky-400">double</span> r){" "}
          <span className="text-accent">implements</span> Shape {"{}"}
          {"\n"}
          <span className="text-accent">record</span> Square(<span className="text-sky-600 dark:text-sky-400">double</span> side){" "}
          <span className="text-accent">implements</span> Shape {"{}"}
          {"\n\n"}
          <span className="text-sky-600 dark:text-sky-400">static double</span> area(Shape shape) {"{"}
          {"\n  "}
          <span className="text-accent">return switch</span> (shape) {"{"}
          {"\n    "}
          <span className="text-accent">case</span> Circle c -&gt; Math.PI * c.r() * c.r();
          {"\n    "}
          <span className="text-accent">case</span> Square s -&gt; s.side() * s.side();
          {"\n  "}
          {"};"}
          {"\n"}
          {"}"}
        </code>
      </pre>
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 font-mono text-[0.68rem] text-muted-foreground">
        <span>javac --release 21</span>
        <span className="text-emerald-600 dark:text-emerald-400">compiles · exhaustive</span>
      </div>
    </div>
  );
}

function TrackCard({
  title,
  description,
  count,
  href,
}: {
  title: string;
  description?: string;
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-[0_10px_30px_-20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.9rem] font-semibold tracking-tight group-hover:text-accent">
          {title}
        </span>
        <span className="font-mono text-[0.68rem] text-muted-foreground">{count}</span>
      </div>
      {description ? (
        <span className="mt-1.5 line-clamp-2 text-[0.8rem] leading-relaxed text-muted-foreground">
          {description}
        </span>
      ) : null}
    </Link>
  );
}

function DocRow({ doc }: { doc: NavDoc }) {
  return (
    <Link
      href={doc.href}
      className="group flex items-baseline gap-4 border-b border-border/70 py-3 last:border-0"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[0.92rem] font-medium group-hover:text-accent">
          {doc.title}
        </span>
        <span className="mt-0.5 block truncate text-[0.78rem] text-muted-foreground">
          {doc.description}
        </span>
      </span>
      <span className="shrink-0 font-mono text-[0.68rem] text-muted-foreground">
        {doc.readingTime} min
      </span>
    </Link>
  );
}

export default function HomePage() {
  const docs = getAllDocs();
  const tracks = getTracks();
  const stats = getStats();

  const featured = featuredSlugs
    .map((slug) => docs.find((doc) => doc.slug.join("/") === slug))
    .filter((doc): doc is NavDoc => Boolean(doc));

  const startHere = featured.length > 0 ? featured : docs.slice(0, 3);

  const recent = [...docs]
    .filter((doc) => doc.updated)
    .sort((a, b) => (a.updated! < b.updated! ? 1 : -1))
    .slice(0, 5);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <div aria-hidden className="doc-grid-bg pointer-events-none absolute inset-0 opacity-70" />
        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:py-20">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground">
              <Sparkles className="size-3 text-accent" />
              Notes · not a tutorial mill
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
              Advanced Java, explained the way it{" "}
              <span className="text-accent">actually</span> works.
            </h1>
            <p className="mt-5 max-w-lg text-[0.97rem] leading-relaxed text-muted-foreground">
              Deep notes on the object model, generics, concurrency, collections and the JVM —
              paired with one-page revision sheets and the interview questions that follow from
              them. Diagrams, runnable examples, and the parts most tutorials skip.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/learn"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[0.88rem] font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <BookOpen className="size-4" />
                Start the course
              </Link>
              <Link
                href="/learn/quick-notes"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-[0.88rem] font-medium transition-colors hover:bg-muted"
              >
                Revision notes
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/70 pt-5 text-[0.78rem]">
              {[
                { label: "chapters", value: stats.docs },
                { label: "modules", value: stats.sections },
                { label: "tracks", value: stats.tracks },
                { label: "min of reading", value: stats.minutes },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="font-mono text-[1.05rem] font-semibold text-foreground">
                    {item.value}
                  </dd>
                  <dd className="text-muted-foreground">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-rise lg:pl-4">{heroCode()}</div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight">Start here</h2>
                <p className="mt-1 text-[0.85rem] text-muted-foreground">
                  The three chapters that set up everything else.
                </p>
              </div>
              <Link
                href="/learn"
                className="shrink-0 text-[0.78rem] text-muted-foreground hover:text-accent"
              >
                All chapters →
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {startHere.map((doc, index) => (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/60"
                >
                  <span className="font-mono text-[0.68rem] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 text-[0.92rem] font-medium leading-snug group-hover:text-accent">
                    {doc.title}
                  </span>
                  <span className="mt-1.5 line-clamp-3 text-[0.78rem] leading-relaxed text-muted-foreground">
                    {doc.description}
                  </span>
                  <span className="mt-auto flex items-center gap-3 pt-4 text-[0.68rem] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3" /> {doc.readingTime} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="size-3" /> {doc.section ?? doc.track}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[1.35rem] font-semibold tracking-tight">Recently updated</h2>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Notes get revisited as the JVM and the frameworks move.
            </p>
            <div className="mt-4">
              {(recent.length > 0 ? recent : docs.slice(0, 5)).map((doc) => (
                <DocRow key={doc.href} doc={doc} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/25">
        <div className="container-page py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-tight">The library</h2>
              <p className="mt-1 text-[0.85rem] text-muted-foreground">
                One course, several ways in. Every track is plain MDX in the repository.
              </p>
            </div>
            <Badge variant="outline">content-first · git-backed</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => {
              const count = countDocs(track);
              const first = track.children[0];
              return (
                <TrackCard
                  key={track.slug.join("/")}
                  title={track.title}
                  description={track.description}
                  count={count}
                  href={
                    first
                      ? first.type === "doc"
                        ? first.href
                        : `/learn/${first.slug.join("/")}`
                      : "/learn"
                  }
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="text-[1.25rem] font-semibold tracking-tight">
              Written to be re-read the night before an interview.
            </h2>
            <p className="mt-2 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Every chapter ends with the questions it implies, and every track has a condensed
              revision sheet. No accounts, no progress bars — just notes you can grep, print or
              fork.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/learn/interview-questions"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-[0.85rem] font-medium text-accent-foreground hover:opacity-90"
            >
              Interview bank
            </Link>
            <Link
              href={siteConfig.github}
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-[0.85rem] font-medium hover:bg-muted"
            >
              Fork the notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function countDocs(group: NavGroup): number {
  return group.children.reduce(
    (total, child) => total + (child.type === "doc" ? 1 : countDocs(child)),
    0,
  );
}
