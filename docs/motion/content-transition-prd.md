# Content Loading Transition Animation — PRD

## Intent

When a page or section loads, content should feel like it arrives — not like it appears. Each element enters from below and fades in, one after another, with timing that feels calm and deliberate. The goal is to give the user a moment to orient before content is fully present, without making them wait.

This is not a decorative effect. It is a pacing mechanism. It directs attention sequentially and makes even a dense page feel unhurried on first load.

---

## The Core Animation

Each animated element performs two things simultaneously:

1. **Fades in** — opacity moves from `0` to `1`
2. **Rises up** — translates from `200px` below its final position to `0`

These two properties animate together in a single keyframe, over `1.4 seconds`, using a strongly decelerating easing curve.

### Keyframe

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(200px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

The `both` fill mode is essential — it keeps the element invisible and shifted down before its delay has elapsed. Without it, elements flash into view at their final position before the animation starts.

### Flat fade variant (no movement)

For elements like page wrappers or containers that should not move — only appear:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## The Easing Curve

```
cubic-bezier(0.16, 1, 0.3, 1)
```

This is an expo-out curve. It means:

- The element moves **fast at the start** — it arrives quickly
- It **decelerates sharply** as it settles into place
- The final rest feels soft and natural, not mechanical

This curve is used consistently across **all** animated elements, including transitions and collapses elsewhere in the UI. Consistency in easing across a product is what makes motion feel cohesive rather than accidental.

---

## The Stagger System

Elements do not all animate at once. Each element is assigned an index (`--i`) and receives a computed delay that staggers their entrance sequentially. The delays are **not evenly spaced** — the interval between each step grows slightly, so the stagger itself decelerates as content loads. This mirrors the easing of the animation curve at a macro level.

### Two tokens control the entire schedule

```css
:root {
  --stagger-base:   100ms;   /* gap before element 1 starts after element 0 */
  --stagger-growth:  10ms;   /* each subsequent gap grows by this amount */
}
```

### Delay formula

Each element sets a CSS custom property `--i` (its zero-based index). The animation delay is computed automatically via `calc()`:

```
delay(i) = i × --stagger-base + i × (i - 1) / 2 × --stagger-growth
```

This is the closed-form sum of arithemtic series: `base, base + growth, base + 2×growth, ...`

No hardcoded delay classes are needed. The system scales to any number of elements.

### Animation classes

```css
.animate-fade-in-up {
  --i: 0;
  animation: fade-in-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(
    var(--i) * var(--stagger-base) +
    var(--i) * (var(--i) - 1) / 2 * var(--stagger-growth)
  );
}

.animate-fade-in {
  --i: 0;
  animation: fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(
    var(--i) * var(--stagger-base) +
    var(--i) * (var(--i) - 1) / 2 * var(--stagger-growth)
  );
}
```

### Resulting schedule (with default tokens)

| i | Delay | Gap from previous |
|---|-------|-------------------|
| 0 | 0ms | — |
| 1 | 100ms | 100ms |
| 2 | 210ms | 110ms |
| 3 | 330ms | 120ms |
| 4 | 460ms | 130ms |
| 5 | 600ms | 140ms |
| 6 | 750ms | 150ms |
| 7 | 910ms | 160ms |
| 8 | 1080ms | 170ms |
| 9 | 1260ms | 180ms |
| 10 | 1450ms | 190ms |

The growth is subtle — you won't consciously notice it — but it prevents the stagger from feeling robotic. The rhythm slows as the page fills in.

### Tuning

Change two values in `:root` and every element on every page updates:

| Goal | Adjustment |
|------|------------|
| Tighter wave (more overlap, more flow) | Lower `--stagger-base` (try `60ms`) |
| Looser wave (more sequential) | Raise `--stagger-base` (try `150ms`) |
| More deceleration (early items close, later items spread) | Raise `--stagger-growth` (try `20ms`) |
| Uniform spacing (metronome) | Set `--stagger-growth: 0ms` |

---

## Implementation

### Step 1 — CSS (add to your global stylesheet)

Add the stagger tokens, keyframes, and animation classes. This is the entire CSS surface area:

```css
:root {
  --stagger-base:   100ms;
  --stagger-growth:  10ms;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(200px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animate-fade-in-up {
  --i: 0;
  animation: fade-in-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i) * var(--stagger-base) + var(--i) * (var(--i) - 1) / 2 * var(--stagger-growth));
}

.animate-fade-in {
  --i: 0;
  animation: fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i) * var(--stagger-base) + var(--i) * (var(--i) - 1) / 2 * var(--stagger-growth));
}
```

### Step 2 — React component (optional but recommended)

Create a `FadeInUp` wrapper component for ergonomic usage. Place it in your UI primitives directory (e.g. `src/components/ui/fade-in-up.tsx`).

This component requires a `cn()` utility for merging class names (e.g. from `clsx` + `tailwind-merge`, or any string concatenation). If the project does not have one, use simple string concatenation instead.

```tsx
import { cn } from "@/lib/utils"

interface FadeInUpProps {
  /** Stagger index — controls animation delay via CSS calc(). */
  i: number
  /** Additional CSS classes merged onto the wrapper div. */
  className?: string
  children: React.ReactNode
}

/**
 * FadeInUp — content entrance animation wrapper.
 *
 * Applies the animate-fade-in-up CSS animation with a computed
 * stagger delay based on the element's index `i`.
 *
 * Delay formula (in CSS):
 *   delay(i) = i × --stagger-base + i×(i−1)/2 × --stagger-growth
 *
 * Tweak --stagger-base and --stagger-growth in :root (global CSS)
 * to change the feel globally. No per-element configuration needed.
 */
export function FadeInUp({ i, className, children }: FadeInUpProps) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ "--i": i } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
```

### Step 3 — Usage in page components

Wrap each content block in `<FadeInUp>`, incrementing `i` from `0`:

```tsx
import { FadeInUp } from "@/components/ui/fade-in-up"

export function ExamplePage() {
  return (
    <div className="flex flex-col">
      <FadeInUp i={0}>
        <h1>Page Title</h1>
      </FadeInUp>

      <FadeInUp i={1} className="mt-3">
        <p>Subtitle or tagline</p>
      </FadeInUp>

      <FadeInUp i={2} className="mt-8">
        <p>Body content paragraph one.</p>
      </FadeInUp>

      <FadeInUp i={3} className="mt-4">
        <p>Body content paragraph two.</p>
      </FadeInUp>

      <FadeInUp i={4} className="mt-10">
        <nav>Links or actions</nav>
      </FadeInUp>
    </div>
  )
}
```

For containers that should fade in without movement, apply the class directly:

```html
<div class="animate-fade-in" style="--i: 0">Page shell</div>
```

For non-React projects, apply classes and `--i` directly in HTML:

```html
<div class="animate-fade-in-up" style="--i: 0">First element</div>
<div class="animate-fade-in-up" style="--i: 1">Second element</div>
<div class="animate-fade-in-up" style="--i: 2">Third element</div>
```

---

## Design Decisions Worth Preserving

**200px starting offset is intentional.** A smaller value (e.g. 16px or 32px) produces a subtle nudge — that is a different effect. The 200px distance means the element arrives with energy, not just materializes. The easing curve absorbs the distance gracefully.

**1.4s duration is intentional.** It sounds long on paper, but because the easing is expo-out, the element reaches roughly 90% of its final position within the first 400ms. The remaining time is the tail — a slow, imperceptible drift into place that makes the landing feel gentle. Shortening the duration breaks this tail and makes arrivals feel abrupt.

**CSS calc, not JavaScript orchestration.** The stagger is achieved entirely with CSS custom properties and `calc()`, not JavaScript-driven timers or animation libraries. This keeps the animation deterministic, avoids layout thrashing, and means it works even before a framework has hydrated.

**`animation-fill-mode: both`** — never omit this. It handles both the pre-animation hold (element stays hidden during delay) and the post-animation hold (element stays at final position after completing). Without it, you get flashes before and snaps after.

**Two tokens, not N delay classes.** Previous iterations used hardcoded `.animate-delay-0` through `.animate-delay-7` classes. This doesn't scale — every new element needs a new class, and tuning requires editing every value. The `--stagger-base` + `--stagger-growth` approach with `calc()` produces the same decelerating schedule from just two numbers, works for any number of elements, and is tunable from a single place.

**The `<FadeInUp>` component is optional.** The system is pure CSS. The React wrapper is a convenience that sets `--i` via inline style and merges class names. In non-React projects, set `style="--i: N"` directly on the element.

---

## When to Use Each Variant

| Situation | What to use |
|-----------|-------------|
| Cards, content blocks, sections | `<FadeInUp i={N}>` or `.animate-fade-in-up` |
| Page shell, background container | `.animate-fade-in` (no movement) |
| First element on the page | `i={0}` |
| Each subsequent element | Increment `i` by one |
| Conditionally rendered sections | Start their `i` from where the last always-present element left off |

---

## What Makes This Feel Right

The smoothness comes from three things working together:

1. The **easing curve** — expo-out means fast arrival, soft landing
2. The **duration** — long enough for the tail to matter, short enough not to feel slow
3. The **stagger interval growth** — the page fills in with a rhythm that slows down, not a metronome

Change any one of these and the feeling shifts. This combination produces motion that reads as calm, confident, and considered — not flashy.
