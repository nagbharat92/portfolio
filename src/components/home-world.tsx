import { Button } from "@/components/ui/button"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { useFolderTree } from "@/components/folder-tree"
import { IsometricGrid } from "@/components/isometric-grid"

/**
 * HomeWorld — the immersive home page.
 *
 * The creative "front door". A calm, full-bleed title screen layered over the
 * interactive isometric grid (IsometricGrid), which sits behind the content as
 * a decorative, hover-reactive backdrop. The two buttons drop into the sidebar
 * shell; the layout seam (immersive home vs. shell, chosen in App.tsx) is
 * unchanged.
 *
 * Content rises in with the staggered FadeInUp entrance the canvas pages use;
 * the grid fades in alongside it.
 */
export function HomeWorld() {
  const { select } = useFolderTree()

  return (
    // bg-background covers the global body dot-grid so the isometric field is
    // the only backdrop on home (the dots remain on the shell routes).
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      {/* Decorative, hover-reactive isometric field behind the content. */}
      <IsometricGrid className="absolute inset-0 animate-fade-in" />

      <div className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center p-(--page-inset) text-center">
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
    </div>
  )
}
