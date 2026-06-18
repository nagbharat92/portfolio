import { Button } from "@/components/ui/button"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { useFolderTree } from "@/components/folder-tree"

/**
 * HomeWorld — the immersive home page.
 *
 * The creative "front door". For now it is a calm, full-bleed title screen with
 * two navigation buttons that drop into the sidebar shell. The isometric world
 * will replace the inside of this component later; the layout seam (immersive
 * home vs. shell, chosen in App.tsx) stays the same.
 *
 * Content rises in with the same staggered FadeInUp entrance the canvas pages use.
 */
export function HomeWorld() {
  const { select } = useFolderTree()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-(--page-inset) text-center">
      <FadeInUp i={0}>
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Bharat Nag
        </h1>
      </FadeInUp>

      <FadeInUp i={1}>
        <p className="mt-(--hero-subtitle-gap) text-xl text-muted-foreground">
          Building thoughtfully at the intersection of design and code.
        </p>
      </FadeInUp>

      <FadeInUp
        i={2}
        className="mt-(--hero-divider-gap) flex flex-wrap items-center justify-center gap-4"
      >
        <Button size="lg" variant="secondary" onClick={() => select("about-bharat-nag")}>
          About
        </Button>
        <Button size="lg" variant="secondary" onClick={() => select("notifications")}>
          Projects
        </Button>
      </FadeInUp>
    </div>
  )
}
