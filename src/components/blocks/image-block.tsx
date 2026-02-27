import { FadeInUp } from "@/components/ui/fade-in-up"
import type { ImageBlock } from "@/data/pages"

export function ImageBlockRenderer({ block, index }: { block: ImageBlock; index: number }) {
  return (
    <FadeInUp i={index}>
      <figure>
        <img
          src={block.src}
          alt={block.alt ?? ""}
          className="w-full rounded-xl"
          loading="lazy"
        />
        {block.caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    </FadeInUp>
  )
}
