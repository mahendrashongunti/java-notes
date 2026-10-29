import type { MetadataRoute } from "next";
import { getAllDocs, getAllGroups } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/learn`, changeFrequency: "weekly", priority: 0.9 },
    ...getAllGroups().map((group) => ({
      url: `${base}/learn/${group.slug.join("/")}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllDocs().map((doc) => ({
      url: `${base}${doc.href}`,
      lastModified: doc.updated ? new Date(doc.updated) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
