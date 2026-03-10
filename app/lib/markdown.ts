import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

export function markdownFromHTML(html: string): string {
    return unified()
        .use(rehypeParse)
        .use(rehypeRemark)
        .use(remarkGfm)
        .use(remarkStringify)
        .processSync(html)
        .toString();
}

export function htmlFromMarkdown(markdown: string): string {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkHtml)
        .processSync(markdown)
        .toString();
}

/**
 * Render stored devotion content as HTML.
 * New devotions are stored as raw HTML (to preserve inline styles like text-color and
 * highlight). Older devotions are stored as Markdown — we detect which format it is
 * and convert accordingly for full backward compatibility.
 */
export function contentToHtml(content: string): string {
    if (!content) return "";
    // Heuristic: HTML content starts with a tag; Markdown never starts with "<"
    if (content.trimStart().startsWith("<")) return content;
    return htmlFromMarkdown(content);
}
