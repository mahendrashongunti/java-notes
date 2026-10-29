import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/80 bg-muted/25">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-mono text-[0.78rem] font-semibold tracking-tight">
            <span className="text-accent">{"{}"}</span> {siteConfig.name}
          </p>
          <p className="mt-2 max-w-56 text-[0.8rem] leading-relaxed text-muted-foreground">
            {siteConfig.tagline} Notes written while building real systems.
          </p>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Study
          </p>
          <ul className="mt-3 space-y-2 text-[0.82rem]">
            <li>
              <Link href="/learn" className="text-foreground/80 hover:text-accent">
                Full course
              </Link>
            </li>
            <li>
              <Link href="/learn/quick-notes" className="text-foreground/80 hover:text-accent">
                Revision notes
              </Link>
            </li>
            <li>
              <Link
                href="/learn/interview-questions"
                className="text-foreground/80 hover:text-accent"
              >
                Interview questions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Core Java
          </p>
          <ul className="mt-3 space-y-2 text-[0.82rem]">
            <li>
              <Link
                href="/learn/java/core-java"
                className="text-foreground/80 hover:text-accent"
              >
                Advanced Core Java
              </Link>
            </li>
            <li>
              <Link href="/learn/java/collections" className="text-foreground/80 hover:text-accent">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/learn/java/concurrency" className="text-foreground/80 hover:text-accent">
                Concurrency
              </Link>
            </li>
            <li>
              <Link href="/learn/java/jvm" className="text-foreground/80 hover:text-accent">
                JVM internals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            This site
          </p>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">
            Content lives in <code className="font-mono text-[0.76rem]">content/</code> as MDX. Add a
            file, and it appears in the course.
          </p>
          <Link
            href={siteConfig.github}
            className="mt-3 inline-block text-[0.82rem] text-foreground/80 hover:text-accent"
          >
            Source on GitHub ↗
          </Link>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="container-page flex flex-col gap-2 py-4 text-[0.72rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.author}. Notes are for study, not production
            guarantees.
          </p>
          <p className="font-mono">Built with Next.js · MDX · Tailwind</p>
        </div>
      </div>
    </footer>
  );
}
