import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FadeInUp } from "@/components/ui/fade-in-up"
import type { TextBlock } from "@/data/pages"

export function TextBlockRenderer({ block, index }: { block: TextBlock; index: number }) {
  return (
    <FadeInUp i={index}>
      {block.title && (
        <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
          {block.title}
        </h2>
      )}
      <div className="text-block-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="text-base leading-relaxed text-foreground/80 mb-4 last:mb-0">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors duration-150"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-4 text-foreground/80 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-4 text-foreground/80 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="text-base leading-relaxed">{children}</li>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm">
                {children}
              </code>
            ),
            hr: () => <hr className="border-border my-6" />,
          }}
        >
          {block.body}
        </ReactMarkdown>
      </div>
    </FadeInUp>
  )
}
