"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { SearchEntry } from "@/lib/content";
import { cn } from "@/lib/utils";

type Scored = { entry: SearchEntry; score: number };

function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const headings = entry.headings.join(" ").toLowerCase();
  const tags = entry.tags.join(" ").toLowerCase();
  const text = entry.text.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    if (title.includes(token)) tokenScore += title.startsWith(token) ? 24 : 14;
    if (headings.includes(token)) tokenScore += 6;
    if (tags.includes(token)) tokenScore += 6;
    if (description.includes(token)) tokenScore += 5;
    if (text.includes(token)) tokenScore += 2;
    if (entry.track.toLowerCase().includes(token)) tokenScore += 3;
    if (tokenScore === 0) return 0;
    score += tokenScore;
  }
  return score;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const tokens = trimmed.split(/\s+/).filter((token) => token.length > 1);
  if (tokens.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);
  const lowered = tokens.map((token) => token.toLowerCase());

  return (
    <>
      {parts.map((part, index) =>
        lowered.some((token) => part.toLowerCase().includes(token)) ? (
          <mark key={index} className="rounded bg-accent-soft px-0.5 text-accent">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchDialog({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo<Scored[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return entries.slice(0, 6).map((entry) => ({ entry, score: 0 }));
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [entries, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isShortcut) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (results.length ? (current + 1) % results.length : 0));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (results.length ? (current - 1 + results.length) % results.length : 0));
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].entry.href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-[0.8rem] text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground sm:min-w-56"
        aria-label="Search notes"
      >
        <Search className="size-3.5" />
        <span className="hidden flex-1 text-left sm:inline">Search notes…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[12vh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:top-[16vh]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Search notes</DialogTitle>
          <DialogDescription className="sr-only">
            Search every chapter, revision note and interview answer.
          </DialogDescription>

          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search topics, APIs, interview questions…"
              aria-label="Search query"
              className="h-12 w-full bg-transparent text-[0.92rem] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground sm:block">
              ESC
            </kbd>
          </div>

          <div className="max-h-[min(62vh,26rem)] overflow-y-auto p-2 scrollbar-thin">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No notes match <span className="text-foreground">“{query}”</span>. Try “generics”,
                “hashCode” or “executor”.
              </p>
            ) : (
              <>
                <p className="px-2 pb-1.5 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Start here"}
                </p>
                <ul ref={listRef}>
                  {results.map(({ entry }, index) => (
                    <li key={entry.href} data-index={index}>
                      <button
                        type="button"
                        onClick={() => go(entry.href)}
                        onMouseEnter={() => setActive(index)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                          index === active ? "bg-muted" : "hover:bg-muted/60",
                        )}
                      >
                        <span
                          aria-hidden
                          className="mt-1 font-mono text-[0.7rem] text-muted-foreground"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.88rem] font-medium">
                            <Highlight text={entry.title} query={query} />
                          </span>
                          <span className="mt-0.5 block truncate text-[0.76rem] text-muted-foreground">
                            {entry.track}
                            {entry.section ? ` · ${entry.section}` : ""}
                          </span>
                        </span>
                        <CornerDownLeft
                          className={cn(
                            "mt-1 size-3.5 shrink-0 text-muted-foreground",
                            index === active ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[0.68rem] text-muted-foreground">
            <span>↑↓ to navigate</span>
            <span>↵ to open</span>
            <span className="ml-auto font-mono">{entries.length} chapters</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
