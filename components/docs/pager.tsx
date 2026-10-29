import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NavDoc } from "@/lib/content";

export function DocPager({
  previous,
  next,
}: {
  previous: NavDoc | null;
  next: NavDoc | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Chapter navigation" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-ring/50"
        >
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <ArrowLeft className="size-3" /> Previous
          </span>
          <span className="text-[0.9rem] font-medium group-hover:text-accent">{previous.title}</span>
        </Link>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card px-4 py-3 text-right transition-colors hover:border-ring/50"
        >
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Next <ArrowRight className="size-3" />
          </span>
          <span className="text-[0.9rem] font-medium group-hover:text-accent">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
