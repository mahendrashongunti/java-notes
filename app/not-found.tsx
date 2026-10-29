import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This note does not exist.</h1>
      <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
        The chapter may have moved, or the link may point at a file that was never written. The
        course index is the safest place to continue.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/learn"
          className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Course index
        </Link>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
