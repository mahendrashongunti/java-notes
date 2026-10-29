"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({ children, className, ...props }: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = (props as Record<string, unknown>)["data-language"] as string | undefined;

  async function copy() {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative">
      <pre {...props} ref={preRef} className={cn("my-0", className)}>
        {children}
      </pre>
      <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {language ? (
          <span className="rounded border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        ) : null}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="pointer-events-auto inline-flex size-7 items-center justify-center rounded-md border border-border bg-background/90 text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
