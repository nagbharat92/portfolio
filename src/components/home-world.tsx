import { FadeInUp } from "@/components/ui/fade-in-up"
import { RoughFolder } from "@/components/rough-folder"

/**
 * HomeWorld — the immersive home page.
 *
 * The creative "front door". A calm, full-bleed title screen. The hand-drawn
 * RoughFolders drop into the sidebar shell (or link out); the layout seam
 * (immersive home vs. shell, chosen in App.tsx) is unchanged.
 *
 * Content rises in with the staggered FadeInUp entrance the canvas pages use.
 */
export function HomeWorld() {
  return (
    // bg-background covers the global body dot-grid so home stays a clean,
    // calm title screen (the dots remain on the shell routes).
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      <div className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center p-(--page-inset)">
        {/* Centered as a group, but left-aligned within — the title and tagline
            start at the same left edge as the first nav folder. */}
        <div className="flex w-fit flex-col items-start text-left">
          <FadeInUp i={0}>
            <h1 className="text-[2.5rem] font-bold tracking-tight text-foreground">
              Bharat Nag
            </h1>
          </FadeInUp>

          <FadeInUp i={1}>
            <p className="mt-(--hero-subtitle-gap) text-xl text-muted-foreground">
              Building thoughtfully at the intersection of design and code.
            </p>
          </FadeInUp>

          {/* Primary navigation as hand-drawn ink folders. Each has a FIXED seed
              so its sketch is stable. `to` opens an existing sidebar page; `href`
              is an external quick-link (no page yet). */}
          <nav
            aria-label="Primary"
            className="mt-(--hero-divider-gap) flex flex-wrap items-start justify-start gap-x-10 gap-y-8"
          >
            <RoughFolder index={2} seed={41} label="About" to="about-bharat-nag" />
            <RoughFolder index={3} seed={7} label="Projects" to="notifications" />
            <RoughFolder index={4} seed={88} label="GitHub" href="https://github.com/nagbharat92" />
            <RoughFolder index={5} seed={23} label="Contact" href="mailto:nagbharat92@gmail.com" />
          </nav>
        </div>
      </div>
    </div>
  )
}
