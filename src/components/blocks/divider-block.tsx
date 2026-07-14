import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughLine } from "@/components/ui/rough-ink"

export function DividerBlockRenderer({ index }: { index: number }) {
  return (
    <FadeInUp i={index}>
      <RoughLine seed={12} className="w-12 text-muted-foreground" />
    </FadeInUp>
  )
}
