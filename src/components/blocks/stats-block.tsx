import { Fragment } from "react"
import { FadeInUp } from "@/components/ui/fade-in-up"
import type { StatsBlock } from "@/data/pages"

export function StatsBlockRenderer({ block, index }: { block: StatsBlock; index: number }) {
  return (
    <FadeInUp i={index}>
      <div className="flex flex-wrap items-center gap-x-(--stats-gap) gap-y-(--stats-gap)">
        {block.items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className="text-muted-foreground/40 select-none" aria-hidden>·</span>
            )}
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 underline underline-offset-4"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </FadeInUp>
  )
}
