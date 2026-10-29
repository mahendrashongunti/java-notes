import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutProps = {
  type?: "note" | "tip" | "warning" | "danger" | "java";
  title?: string;
  children: ReactNode;
  className?: string;
};

const styles: Record<
  NonNullable<CalloutProps["type"]>,
  { label: string; wrapper: string; marker: string }
> = {
  note: {
    label: "Note",
    wrapper: "border-sky-500/30 bg-sky-500/[0.06]",
    marker: "text-sky-600 dark:text-sky-400",
  },
  tip: {
    label: "Tip",
    wrapper: "border-emerald-500/30 bg-emerald-500/[0.06]",
    marker: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    label: "Watch out",
    wrapper: "border-amber-500/35 bg-amber-500/[0.08]",
    marker: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    label: "Pitfall",
    wrapper: "border-rose-500/30 bg-rose-500/[0.06]",
    marker: "text-rose-600 dark:text-rose-400",
  },
  java: {
    label: "Under the hood",
    wrapper: "border-accent/35 bg-accent-soft/60",
    marker: "text-accent",
  },
};

export function Callout({ type = "note", title, children, className }: CalloutProps) {
  const style = styles[type];

  return (
    <aside
      className={cn(
        "callout my-6 rounded-xl border px-4 py-3.5 text-[0.94rem] leading-relaxed",
        style.wrapper,
        className,
      )}
    >
      <p
        className={cn(
          "mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.13em]",
          style.marker,
        )}
      >
        {title ?? style.label}
      </p>
      <div className="text-foreground/90">{children}</div>
    </aside>
  );
}

export function KeyPoints({
  title = "Key takeaways",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-8 rounded-xl border border-border bg-muted/40 p-5">
      <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      <div className="text-[0.94rem] [&_li]:my-1.5 [&_ul]:my-0 [&_ul]:pl-5 [&_li::marker]:text-accent">
        {children}
      </div>
    </section>
  );
}

export function Interview({
  question,
  level,
  children,
}: {
  question: string;
  level?: "junior" | "mid" | "senior";
  children: ReactNode;
}) {
  return (
    <details className="group my-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors open:bg-muted/30">
      <summary className="flex cursor-pointer list-none items-start gap-3 text-[0.94rem] font-medium leading-snug marker:hidden [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="mt-0.5 font-mono text-xs text-accent transition-transform group-open:rotate-90"
        >
          ▸
        </span>
        <span className="flex-1">{question}</span>
        {level ? (
          <span className="mt-0.5 rounded-full border border-border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
            {level}
          </span>
        ) : null}
      </summary>
      <div className="mt-3 border-t border-border/70 pt-3 pl-6 text-[0.92rem] text-muted-foreground [&_p]:my-2 [&_ul]:my-2">
        {children}
      </div>
    </details>
  );
}

export function InterviewSet({
  title = "Interview questions",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-10">
      <h2 id="interview-questions" className="!mt-8">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Diagram({
  title,
  caption,
  children,
}: {
  title?: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-border bg-muted/30">
      {title ? (
        <figcaption className="border-b border-border px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-relaxed text-foreground/90">
        {children}
      </pre>
      {caption ? (
        <p className="border-t border-border px-4 py-2.5 text-[0.8rem] text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-6 list-none space-y-5 pl-0 [counter-reset:step] [&>li]:list-none">
      {children}
    </ol>
  );
}

export function Step({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="relative pl-9 [counter-increment:step] before:absolute before:left-0 before:top-0 before:flex before:size-6 before:items-center before:justify-center before:rounded-full before:border before:border-border before:bg-background before:font-mono before:text-[0.7rem] before:text-accent before:content-[counter(step)]">
      <p className="!my-0 font-semibold">{title}</p>
      <div className="mt-1 text-[0.94rem] text-muted-foreground [&_p]:my-1.5">
        {children}
      </div>
    </li>
  );
}

export function ShellOutput({ children }: { children: ReactNode }) {
  return (
    <pre className="my-5 overflow-x-auto rounded-xl border border-border bg-[#0d1117] px-4 py-3 font-mono text-[0.8rem] leading-relaxed text-[#c9d1d9]">
      {children}
    </pre>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="!mt-0 !mb-6 !text-[1.06rem] !leading-relaxed !text-muted-foreground">
      {children}
    </p>
  );
}

export function Wide({ children, className }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("my-6", className)}>{children}</div>;
}

/** A deliberately short revision block for the day before an interview. */
export function RevisionNote({
  title = "One-minute revision",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-9 rounded-xl border border-l-2 border-accent/30 border-l-accent bg-accent-soft/30 px-5 py-4">
      <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-accent">
        {title}
      </p>
      <div className="text-[0.92rem] leading-relaxed [&_li]:my-1 [&_ul]:my-0 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
