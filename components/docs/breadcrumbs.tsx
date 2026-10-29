import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { title: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.74rem] text-muted-foreground">
        <li>
          <Link href="/learn" className="transition-colors hover:text-foreground">
            Course
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 opacity-60" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.title}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground/80">
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
