import type { Block } from "@/data/pages"
import { IframeBlockRenderer } from "@/components/blocks/iframe-block"
import { StatsBlockRenderer } from "@/components/blocks/stats-block"
import { TextBlockRenderer } from "@/components/blocks/text-block"
import { ImageBlockRenderer } from "@/components/blocks/image-block"
import { VideoBlockRenderer } from "@/components/blocks/video-block"
import { DividerBlockRenderer } from "@/components/blocks/divider-block"
import { CustomBlockRenderer } from "@/components/blocks/custom-block"

interface BlockRendererProps {
  block: Block
  index: number
}

export function BlockRenderer({ block, index }: BlockRendererProps) {
  switch (block.type) {
    case 'iframe':  return <IframeBlockRenderer  block={block} index={index} />
    case 'stats':   return <StatsBlockRenderer   block={block} index={index} />
    case 'text':    return <TextBlockRenderer    block={block} index={index} />
    case 'image':   return <ImageBlockRenderer   block={block} index={index} />
    case 'video':   return <VideoBlockRenderer   block={block} index={index} />
    case 'divider': return <DividerBlockRenderer             index={index} />
    case 'custom':  return <CustomBlockRenderer  block={block} index={index} />
  }
}
