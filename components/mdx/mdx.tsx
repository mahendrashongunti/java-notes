import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx";

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              {
                theme: {
                  light: "github-light",
                  dark: "github-dark-default",
                },
                keepBackground: false,
                defaultLang: "text",
              },
            ],
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: ["anchor-link"],
                  ariaLabel: "Link to this section",
                },
                content: { type: "text", value: "#" },
              },
            ],
          ],
        },
      }}
    />
  );
}
