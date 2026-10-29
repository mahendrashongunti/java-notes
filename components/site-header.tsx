import Link from "next/link";
import { Menu } from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavGroup, SearchEntry } from "@/lib/content";
import { siteConfig } from "@/lib/site";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
      <span className="flex size-8 items-center justify-center rounded-lg border border-accent/25 bg-accent-soft font-mono text-[0.8rem] font-semibold text-accent transition-colors group-hover:border-accent/50">
        {"{}"}
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="mt-0.5 hidden text-[0.66rem] text-muted-foreground sm:block">
          Advanced Java &amp; backend notes
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({
  tracks,
  searchIndex,
}: {
  tracks: NavGroup[];
  searchIndex: SearchEntry[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-[var(--header-h)] items-center gap-3">
        <Sheet>
          <SheetTrigger
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent className="px-5 pb-6">
            <SheetTitle className="sr-only">Notes navigation</SheetTitle>
            <div className="flex h-[var(--header-h)] items-center">
              <Wordmark />
            </div>
            <div className="-mr-3 mt-2 flex-1 overflow-y-auto pr-3 scrollbar-thin">
              <SidebarNav tracks={tracks} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <ThemeToggle />
              <Link
                href={siteConfig.github}
                className="text-[0.78rem] text-muted-foreground hover:text-foreground"
              >
                GitHub ↗
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <Wordmark />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-[0.82rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog entries={searchIndex} />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href={siteConfig.github}
            aria-label="View source on GitHub"
            className="hidden size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <GithubIcon className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
