import { FadeInUp } from "@/components/ui/fade-in-up"
import type { VideoBlock } from "@/data/pages"

export function VideoBlockRenderer({ block, index }: { block: VideoBlock; index: number }) {
  return (
    <FadeInUp i={index}>
      <div className="aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={block.embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          loading="lazy"
          title="Video embed"
        />
      </div>
      {block.caption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {block.caption}
        </p>
      )}
    </FadeInUp>
  )
}
