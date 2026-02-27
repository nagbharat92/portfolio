import { FadeInUp } from "@/components/ui/fade-in-up"

export function DividerBlockRenderer({ index }: { index: number }) {
  return (
    <FadeInUp i={index}>
      <hr className="border-border" />
    </FadeInUp>
  )
}
