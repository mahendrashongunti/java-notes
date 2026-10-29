"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-card p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={`${option.label} theme`}
            aria-pressed={active}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
