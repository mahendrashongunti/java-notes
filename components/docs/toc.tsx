"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Offset of the sticky header plus breathing room. */
const ACTIVE_OFFSET = 96;

function useActiveHeading(headings: Heading[]) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      let current = elements[0].id;

      for (const element of elements) {
        if (element.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) {
          current = element.id;
        } else {
          break;
        }
      }

      // At the very bottom of the page the last heading is active even if it never crossed the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = elements[elements.length - 1].id;

      setActive(current);
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  return active;
}

export function Toc({ headings }: { headings: Heading[] }) {
  const active = useActiveHeading(headings);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 space-y-0.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 text-[0.79rem] leading-snug transition-colors",
                heading.level === 3 ? "pl-6" : "pl-3.5",
                active === heading.id
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileToc({ headings }: { headings: Heading[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  if (headings.length === 0) return null;

  return (
    <details
      ref={detailsRef}
      className="mb-8 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm xl:hidden"
    >
      <summary className="cursor-pointer list-none font-medium text-muted-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        On this page
        <span className="ml-2 font-mono text-[0.7rem] text-muted-foreground/70">
          {headings.length}
        </span>
      </summary>
      <ul className="mt-2 space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={() => detailsRef.current?.removeAttribute("open")}
              className={cn(
                "-ml-px block border-l border-transparent py-0.5 text-[0.82rem] text-muted-foreground hover:border-accent hover:text-accent",
                heading.level === 3 ? "pl-5" : "pl-3",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
