import type { CustomBlock } from "@/data/pages"
import { HomeHero } from "@/components/blocks/custom/home-hero"
import { HomeSocial } from "@/components/blocks/custom/home-social"
import { FolderLab } from "@/components/blocks/custom/folder-lab"

type CustomBlockComponent = React.ComponentType<{
  index: number
  props?: Record<string, unknown>
}>

/**
 * REGISTRY — maps componentId strings to React components.
 *
 * To add a new custom block:
 *   1. Create the component in src/components/blocks/custom/
 *   2. Import it here
 *   3. Add one entry to REGISTRY
 */
const REGISTRY: Record<string, CustomBlockComponent> = {
  'home-hero':   HomeHero,
  'home-social': HomeSocial,
  'folder-lab':  FolderLab,
}

export function CustomBlockRenderer({
  block,
  index,
}: {
  block: CustomBlock
  index: number
}) {
  const Component = REGISTRY[block.componentId]

  if (!Component) {
    if ((import.meta as unknown as { env: { DEV: boolean } }).env.DEV) {
      console.warn(
        `[CustomBlock] No component registered for componentId: "${block.componentId}"`
      )
    }
    return null
  }

  return <Component index={index} props={block.props} />
}
