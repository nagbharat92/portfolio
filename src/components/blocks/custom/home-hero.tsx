import { FadeInUp } from "@/components/ui/fade-in-up"

interface HomeHeroProps {
  index: number
  props?: Record<string, unknown>
}

export function HomeHero({ index }: HomeHeroProps) {
  return (
    <FadeInUp i={index}>
      <h1 className="text-5xl font-bold tracking-tight text-foreground">
        Bharat Nag
      </h1>
      <p className="mt-3 text-xl text-muted-foreground">
        Building thoughtfully at the intersection of design and code.
      </p>
      <div className="mt-10 h-px w-12 bg-border" />
    </FadeInUp>
  )
}
