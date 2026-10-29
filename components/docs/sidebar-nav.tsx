"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { NavDoc, NavGroup, NavItem } from "@/lib/content";
import { cn } from "@/lib/utils";

const hrefFor = (slug: string[]) => `/learn/${slug.join("/")}`;

/** `/learn/java` must not match `/learn/java-fullstack`. */
function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function docCount(items: NavItem[]): number {
  return items.reduce(
    (total, item) => total + (item.type === "doc" ? 1 : docCount(item.children)),
    0,
  );
}

function DocLink({
  doc,
  pathname,
  depth,
  onNavigate,
}: {
  doc: NavDoc;
  pathname: string;
  depth: number;
  onNavigate?: () => void;
}) {
  const active = pathname === doc.href;
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <li>
      <Link
        ref={ref}
        href={doc.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "-ml-px flex items-baseline gap-2 border-l py-1 pl-3 text-[0.845rem] leading-snug transition-colors",
          active
            ? "border-accent bg-accent-soft/60 font-medium text-accent"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
        style={{ paddingLeft: `${0.75 + depth * 0.15}rem` }}
      >
        {doc.title}
      </Link>
    </li>
  );
}

function GroupNode({
  group,
  pathname,
  depth,
  openKeys,
  toggle,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  depth: number;
  openKeys: string[];
  toggle: (key: string) => void;
  onNavigate?: () => void;
}) {
  const key = group.slug.join("/");
  const href = hrefFor(group.slug);
  const open = openKeys.includes(key);
  const containsActive = isPathActive(pathname, href);
  const isCurrentPage = pathname === href;
  const panelId = `nav-panel-${key.replace(/\//g, "-")}`;
  const count = useMemo(() => docCount(group.children), [group.children]);

  return (
    <li className={cn(depth === 0 ? "pt-0" : "pt-2.5")}>
      <div className="flex items-center gap-0.5">
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={isCurrentPage ? "page" : undefined}
          style={{ paddingLeft: depth === 0 ? 0 : "0.55rem" }}
          className={cn(
            "min-w-0 flex-1 rounded-sm py-0.5 transition-colors",
            depth === 0
              ? "text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
              : "text-[0.78rem] font-medium",
            isCurrentPage
              ? "text-accent"
              : containsActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {group.title}
        </Link>
        <span
          aria-hidden
          className={cn(
            "font-mono text-[0.6rem] tabular-nums",
            containsActive ? "text-muted-foreground" : "text-muted-foreground/50",
          )}
        >
          {count}
        </span>
        <button
          type="button"
          onClick={() => toggle(key)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Collapse" : "Expand"} ${group.title}`}
          className="-mr-1 inline-flex size-5 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        </button>
      </div>

      <div id={panelId} hidden={!open}>
        <ul className="mt-1 space-y-0.5 border-l border-border/70 pl-0.5">
          {group.children.map((item) =>
            item.type === "doc" ? (
              <DocLink
                key={item.href}
                doc={item}
                pathname={pathname}
                depth={depth}
                onNavigate={onNavigate}
              />
            ) : (
              <GroupNode
                key={item.slug.join("/")}
                group={item}
                pathname={pathname}
                depth={depth + 1}
                openKeys={openKeys}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            ),
          )}
        </ul>
      </div>
    </li>
  );
}

export function SidebarNav({
  tracks,
  onNavigate,
}: {
  tracks: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeKeys = useMemo(
    () =>
      tracks
        .map((track) => ({
          key: track.slug.join("/"),
          active: isPathActive(pathname, hrefFor(track.slug)),
        }))
        .filter((item) => item.active)
        .map((item) => item.key),
    [pathname, tracks],
  );

  const [openKeys, setOpenKeys] = useState<string[]>(activeKeys);

  useEffect(() => {
    setOpenKeys((current) => {
      const missing = activeKeys.filter((key) => !current.includes(key));
      return missing.length === 0 ? current : [...current, ...missing];
    });
  }, [activeKeys]);

  function toggle(key: string) {
    setOpenKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <nav aria-label="Notes navigation" className="text-sm">
      <Link
        href="/learn"
        onClick={onNavigate}
        aria-current={pathname === "/learn" ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.82rem] font-medium transition-colors",
          pathname === "/learn"
            ? "bg-accent-soft text-accent"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span aria-hidden className="font-mono text-xs">
          ◇
        </span>
        Course overview
      </Link>

      <div className="mt-4 divide-y divide-border/60">
        {tracks.map((track) => (
          <div key={track.slug.join("/")} className="py-2.5">
            <ul>
              <GroupNode
                group={track}
                pathname={pathname}
                depth={0}
                openKeys={openKeys}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
