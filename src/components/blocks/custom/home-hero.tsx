import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughLine } from "@/components/ui/rough-ink"

interface HomeHeroProps {
  index: number
  props?: Record<string, unknown>
}

export function HomeHero({ index }: HomeHeroProps) {
  return (
    <FadeInUp i={index}>
      <h1 className="text-[2.5rem] font-bold tracking-tight text-foreground">
        Bharat Nag
      </h1>
      <p className="mt-(--hero-subtitle-gap) text-xl text-muted-foreground">
        Building thoughtfully at the intersection of design and code.
      </p>
      <RoughLine seed={12} className="mt-(--hero-divider-gap) w-12 text-muted-foreground" />
    </FadeInUp>
  )
}
