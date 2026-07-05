import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughLine } from "@/components/ui/rough-ink"

export function DividerBlockRenderer({ index }: { index: number }) {
  return (
    <FadeInUp i={index}>
      <RoughLine className="text-muted-foreground" />
    </FadeInUp>
  )
}
