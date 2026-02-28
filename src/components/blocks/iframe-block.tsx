import { FadeInUp } from "@/components/ui/fade-in-up"
import type { IframeBlock } from "@/data/pages"

export function IframeBlockRenderer({ block, index }: { block: IframeBlock; index: number }) {
  return (
    <FadeInUp i={index}>
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card aspect-[4/3]">
        <iframe
          src={block.url}
          className="h-full w-full"
          loading="lazy"
          title="Project preview"
        />
      </div>
      {block.caption && (
        <p className="mt-(--caption-gap) text-center text-sm text-muted-foreground">
          {block.caption}
        </p>
      )}
    </FadeInUp>
  )
}
