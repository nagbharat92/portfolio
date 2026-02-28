# PRD 03 — Motion Tokens

## Model and Mode

```
Model:   Claude Opus 4.6
Mode:    Agent
Context: Standard
```

**Why Agent directly:** All token values are fully specified in this document. The before and after states are exact. No design judgment is required during execution.

**Instruction for Agent mode:**
```
Read @docs/03-motion-tokens.md in full before doing anything.
Execute all changes described in the Target State section.
Modify exactly these files: src/index.css, src/lib/motion.ts (new file), src/components/folder-tree.tsx.
Touch no other files. Run the verification checklist when done.
```

---

## Purpose of This Document

This document specifies how to introduce a **motion token system** into the project. It defines duration and easing values as named tokens, establishes a bridge between CSS animations and Framer Motion, and replaces all hardcoded animation values in the codebase with references to those tokens.

---

## Context and Rationale

### What is wrong with the current approach

The project currently has motion values scattered across two different systems with no shared vocabulary:

**In `src/index.css` — CSS animations:**
```css
.typewriter-text.typing-in {
  animation: typeIn 0.5s ease-out forwards, blinkCaret 0.5s step-end 2;
}

.typewriter-text.typing-out {
  animation: typeOut 0.5s ease-out forwards;
}
```

**In `src/components/folder-tree.tsx` — Framer Motion:**
```tsx
/* Chevron rotation */
transition={{ duration: 0.15, ease: "easeOut" }}

/* Folder expand/collapse */
transition={{ duration: 0.2, ease: "easeInOut" }}
```

The problems:

**Raw numbers carry no intent.** `0.15`, `0.2`, `0.5` — these values are meaningless in isolation. Why is the chevron 0.15 and not 0.2? Why is the typewriter 0.5 and not 0.3? Without names, there is no answer. Someone reading this code six months from now (including you) cannot tell whether these numbers were chosen deliberately or picked at random.

**CSS and JavaScript are not connected.** If you decide the "standard" interaction speed should change from 200ms to 175ms, you have to know to update both the CSS file and the Framer Motion props — there is no single place to make that change.

**String easing names are fragile.** `"easeOut"` and `"easeInOut"` are Framer Motion's shorthand aliases. They work today, but they are not the same values that CSS `ease-out` and `ease-in-out` use — Framer Motion internally maps them to its own defaults. When this project eventually has both CSS transitions and Framer Motion animations side by side, they will subtly feel different because the easing curves do not match. Defining explicit cubic-bezier values in both systems ensures they are identical.

**No vocabulary for future motion.** As the site grows — page transitions, content panels, hover reveals, loading states — each new animation will be defined by feel rather than by reference to an established scale. Motion consistency requires a shared vocabulary before it is needed, not after.

### Why this matters for design system extraction

Motion tokens are a first-class part of any mature design system. When this project is extracted into a shared package, the motion system exports alongside colours and typography: `@bharat/design-system/motion`. Every consuming app gets the same animation feel. Without defining tokens now, the extraction requires another archaeology pass through every component that uses animation.

### The CSS/JavaScript bridge problem

CSS custom properties and JavaScript are separate runtimes. There is no built-in mechanism to define a value once and have it automatically available in both. The industry-standard solution at this project's scale is: define the canonical values in a dedicated constants file (`src/lib/motion.ts`), use those same values as CSS custom properties in `index.css`, and document that they must stay in sync. This is a known, accepted tradeoff.

More complex solutions (reading CSS variables at runtime via `getComputedStyle`, using build-time token extraction tools) are premature for a project of this size. They will be worth revisiting when the design system is extracted as a shared package.

---

## Scope

### Files to modify

```
src/index.css                       — add motion token block, update typewriter animation
src/lib/motion.ts                   — NEW FILE: JS constants for Framer Motion
src/components/folder-tree.tsx      — update hardcoded Framer Motion transition values
```

### Files that must NOT be modified

```
src/components/ui/*.tsx
src/components/app-sidebar.tsx
src/App.tsx
```

---

## Motion Inventory (complete audit)

Every animation and transition value currently in the codebase:

| File | Value | Context |
|------|-------|---------|
| `index.css` — `.typewriter-text.typing-in` | `0.5s ease-out` | Typewriter reveal animation |
| `index.css` — `.typewriter-text.typing-out` | `0.5s ease-out` | Typewriter erase animation |
| `index.css` — `.typewriter-text.typing-in` | `0.5s step-end` | Caret blink (2 iterations) |
| `folder-tree.tsx` — chevron `motion.span` | `duration: 0.15, ease: "easeOut"` | Icon rotation on folder open/close |
| `folder-tree.tsx` — `motion.ul` | `duration: 0.2, ease: "easeInOut"` | Folder list expand/collapse height |
| `folder-tree.tsx` — button className | `transition-colors duration-150` | Hover colour transition (Tailwind built-in) |

**Note on `transition-colors duration-150`:** This is Tailwind's built-in utility and does not need to be replaced. Tailwind's `duration-150` is the correct tool for simple CSS property transitions on interactive elements. It is not a motion token concern — it is UI chrome behaviour that Tailwind handles correctly. Do not touch it.

---

## The Token System

### Duration scale

Four named steps, covering the full range of UI animation needs:

| Token name | Value | Framer Motion equivalent | Semantic role |
|---|---|---|---|
| `--duration-fast` | 150ms | `0.15` | Micro-interactions: icon rotations, hover state colour changes, focus ring appearance |
| `--duration-base` | 200ms | `0.20` | Standard transitions: expand/collapse, fade in/out, panel reveals |
| `--duration-slow` | 300ms | `0.30` | Larger movements: drawers sliding in, content area transitions, modal enter |
| `--duration-deliberate` | 500ms | `0.50` | Prominent, intentional animations: typewriter, hero reveals, onboarding sequences |

**Rule:** If an animation feels too fast, go one step up. If it feels too slow, go one step down. Do not invent in-between values.

### Easing scale

Four named curves, each with a specific purpose:

| Token name | CSS value | Framer Motion value | Semantic role |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | `[0, 0, 0.2, 1]` | Things entering or decelerating into place. The most common easing for UI. Elements feel like they arrive with purpose. |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | `[0.4, 0, 1, 1]` | Things leaving or accelerating away. Use for elements that are being dismissed or removed. |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | `[0.4, 0, 0.2, 1]` | Symmetric transitions where something both appears and disappears from the same point — expand/collapse, accordion, toggle. |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `[0.34, 1.56, 0.64, 1]` | Subtle overshoot. Use sparingly for elements that should feel physically alive — a tooltip popping in, a selection indicator snapping. Never use on structural layout transitions. |

**Why explicit cubic-bezier values instead of named keywords?**
CSS keywords (`ease-out`, `ease-in-out`) and Framer Motion string aliases (`"easeOut"`, `"easeInOut"`) do not resolve to the same curves. Defining explicit cubic-bezier values in both systems ensures visual consistency: a CSS transition and a Framer Motion animation using the same token will feel identical.

---

## Target State

### Change 1 — Add motion token block to `src/index.css`

Add a new `/* MOTION TOKENS */` section to the primitive `:root` block, immediately after the typography tokens block added in PRD 02. Place it before the semantic tokens section.

```css
/* =============================================================================
   MOTION TOKENS
   Duration and easing values for all animations in the project.
   CSS animations consume these directly via var().
   Framer Motion uses the mirrored values in src/lib/motion.ts.
   If you change a value here, update motion.ts to match, and vice versa.
   ============================================================================= */

:root {
  /* Duration
     fast:       150ms — micro-interactions (icon rotation, hover state)
     base:       200ms — standard transitions (expand/collapse, fades)
     slow:       300ms — larger movements (drawers, panels, modals)
     deliberate: 500ms — prominent animations (typewriter, hero reveals) */
  --duration-fast:       150ms;
  --duration-base:       200ms;
  --duration-slow:       300ms;
  --duration-deliberate: 500ms;

  /* Easing — explicit cubic-bezier values to ensure CSS/JS parity
     ease-out:    things arriving/decelerating — most common
     ease-in:     things leaving/accelerating away
     ease-in-out: symmetric transitions (expand/collapse)
     ease-spring: subtle overshoot for physical feel — use sparingly */
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Change 2 — Update the typewriter animation in `src/index.css`

Replace the hardcoded values in the typewriter animation rules with token references:

```css
/* BEFORE */
.typewriter-text.typing-in {
  animation: typeIn 0.5s ease-out forwards, blinkCaret 0.5s step-end 2;
}

.typewriter-text.typing-out {
  animation: typeOut 0.5s ease-out forwards;
}

/* AFTER */
.typewriter-text.typing-in {
  animation: typeIn var(--duration-deliberate) var(--ease-out) forwards,
             blinkCaret var(--duration-deliberate) step-end 2;
}

.typewriter-text.typing-out {
  animation: typeOut var(--duration-deliberate) var(--ease-out) forwards;
}
```

The `@keyframes` blocks (`typeIn`, `typeOut`, `blinkCaret`) are not changed. Only the animation shorthand properties that reference duration and easing are updated.

### Change 3 — Create `src/lib/motion.ts` (new file)

Create this file at `src/lib/motion.ts`. It mirrors the CSS token values as JavaScript constants for use with Framer Motion.

```typescript
/**
 * Motion tokens — JavaScript constants for Framer Motion.
 *
 * These values mirror the CSS custom properties defined in src/index.css.
 * The two must stay in sync manually. If you change a value here,
 * update the corresponding --duration-* or --ease-* token in index.css.
 *
 * Usage with Framer Motion:
 *   import { duration, ease } from '@/lib/motion'
 *   transition={{ duration: duration.base, ease: ease.out }}
 */

/**
 * Duration values in seconds (Framer Motion uses seconds, not milliseconds).
 *
 * fast:       0.15s (150ms) — micro-interactions: icon rotation, hover states
 * base:       0.20s (200ms) — standard transitions: expand/collapse, fades
 * slow:       0.30s (300ms) — larger movements: drawers, panels, modals
 * deliberate: 0.50s (500ms) — prominent animations: typewriter, hero reveals
 */
export const duration = {
  fast:       0.15,
  base:       0.20,
  slow:       0.30,
  deliberate: 0.50,
} as const

/**
 * Easing curves as cubic-bezier arrays [x1, y1, x2, y2].
 * Framer Motion accepts arrays in this format.
 * Values match the CSS custom properties exactly for visual parity.
 *
 * out:    [0, 0, 0.2, 1]       — things arriving/decelerating — most common
 * in:     [0.4, 0, 1, 1]       — things leaving/accelerating away
 * inOut:  [0.4, 0, 0.2, 1]     — symmetric transitions (expand/collapse)
 * spring: [0.34, 1.56, 0.64, 1] — subtle overshoot — use sparingly
 */
export const ease = {
  out:    [0, 0, 0.2, 1]        as [number, number, number, number],
  in:     [0.4, 0, 1, 1]        as [number, number, number, number],
  inOut:  [0.4, 0, 0.2, 1]      as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const

/**
 * Pre-composed transition presets for common patterns.
 * Use these directly in Framer Motion transition props when the pattern fits.
 *
 * Example:
 *   <motion.span transition={transitions.microInteraction}>
 */
export const transitions = {
  /** Icon rotations, selection indicators, small state changes */
  microInteraction: {
    duration: duration.fast,
    ease: ease.out,
  },
  /** Expand/collapse, accordion, height/opacity reveals */
  expand: {
    duration: duration.base,
    ease: ease.inOut,
  },
  /** Panels, drawers, modals entering */
  enter: {
    duration: duration.slow,
    ease: ease.out,
  },
  /** Panels, drawers, modals leaving */
  exit: {
    duration: duration.slow,
    ease: ease.in,
  },
  /** Prominent reveals — typewriter equivalent in JS */
  deliberate: {
    duration: duration.deliberate,
    ease: ease.out,
  },
  /** Page-level exit — whole page fades out before new page enters.
   *  700ms with ease-in for a deliberate departure. */
  pageExit: {
    duration: 0.70,
    ease: ease.in,
  },
  /** Page-level enter — container opacity fades in quickly;
   *  block-level CSS animations handle the staggered content entrance. */
  pageEnter: {
    duration: 0.30,
    ease: ease.out,
  },
} as const
```

### Change 4 — Update `src/components/folder-tree.tsx`

Replace the two hardcoded Framer Motion `transition` props with references to the motion constants. Add the import at the top of the file.

**Add this import** (alongside the existing imports at the top of the file):

```tsx
import { transitions } from '@/lib/motion'
```

**Update the chevron `motion.span`:**

```tsx
/* BEFORE */
<motion.span
  animate={{ rotate: isOpen ? 90 : 0 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  className="flex shrink-0 items-center"
>

/* AFTER */
<motion.span
  animate={{ rotate: isOpen ? 90 : 0 }}
  transition={transitions.microInteraction}
  className="flex shrink-0 items-center"
>
```

**Update the `motion.ul` expand/collapse:**

```tsx
/* BEFORE */
<motion.ul
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.2, ease: "easeInOut" }}
  className="flex flex-col gap-0.5 overflow-hidden"
>

/* AFTER */
<motion.ul
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={transitions.expand}
  className="flex flex-col gap-0.5 overflow-hidden"
>
```

---

## Rules

### Duration rules

**DO** pick the step that best matches the scale of the interaction. Small, contained elements (icons, badges) get `fast`. Standard UI transitions get `base`. Larger structural changes get `slow`. Prominent, intentional moments get `deliberate`.

**DO NOT** create values between steps (e.g. `0.175`, `0.25`). If no step fits well, the question to ask is whether the animation duration is the real problem — often it is the easing or the animated property that needs adjusting, not a new duration value.

**DO NOT** use `deliberate` for routine UI interactions. It is reserved for animations that are themselves meaningful — the typewriter on a copy interaction, a hero that plays once on load. Using it on hover states or everyday transitions makes the interface feel sluggish.

### Easing rules

**DO** use `ease.out` as the default for almost everything. It is the natural deceleration curve that makes things feel like they arrive with weight and intent.

**DO** use `ease.inOut` specifically for expand/collapse and accordion patterns — things that grow and shrink from a point rather than entering from off-screen.

**DO** use `ease.in` when something is being dismissed or removed. An element that exits with `ease.in` accelerates away cleanly and does not linger.

**DO NOT** use Framer Motion string aliases (`"easeOut"`, `"easeInOut"`) anywhere in the codebase after this change. They are imprecise and do not match the CSS values. The explicit arrays from `motion.ts` must be used instead.

**DO NOT** use `ease.spring` on structural layout transitions (height, width, position). Overshoot on layout properties causes content reflow and looks broken. Reserve it for opacity, scale, and transform-only animations.

### CSS/JS sync rules

**DO** update both `index.css` and `motion.ts` any time a motion value changes. They are two representations of the same system. A comment at the top of each file states this requirement — it is not just documentation, it is a constraint.

**DO NOT** read CSS variables at runtime to feed Framer Motion (e.g. via `getComputedStyle`). This is unnecessarily complex for this project's scale and creates a runtime dependency where none is needed.

### Framer Motion usage rules

**DO** use the pre-composed `transitions.*` presets from `motion.ts` when the pattern matches exactly. This keeps component code clean and the intent obvious.

**DO** compose custom transitions from `duration.*` and `ease.*` primitives when the pattern does not match a preset:
```tsx
transition={{ duration: duration.slow, ease: ease.out }}
```

**DO NOT** pass raw numbers to Framer Motion transition props:
```tsx
// Wrong
transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}

// Correct
transition={{ duration: duration.base, ease: ease.inOut }}
// or
transition={transitions.expand}
```

---

## Dos and Don'ts — Quick Reference

| Scenario | Correct | Wrong |
|---|---|---|
| Icon rotating on click | `transition={transitions.microInteraction}` | `transition={{ duration: 0.15, ease: "easeOut" }}` |
| List expanding/collapsing | `transition={transitions.expand}` | `transition={{ duration: 0.2, ease: "easeInOut" }}` |
| Panel entering from side | `transition={transitions.enter}` | `transition={{ duration: 0.3 }}` |
| Panel exiting | `transition={transitions.exit}` | `transition={transitions.enter}` (wrong — exit uses ease-in) |
| Page switching exit | `exit={{ opacity: 0, transition: transitions.pageExit }}` | `transition={{ duration: 0.2 }}` on both enter/exit |
| Page switching enter | `animate={{ opacity: 1, transition: transitions.pageEnter }}` | Same transition for both directions |
| CSS animation | `animation: fadeIn var(--duration-base) var(--ease-out)` | `animation: fadeIn 0.2s ease-out` |
| Changing standard speed | Update `duration.base` in `motion.ts` AND `--duration-base` in `index.css` | Update only one of the two files |
| Adding a new animation preset | Add to `transitions` object in `motion.ts` | Hardcode values in the component |
| Spring animation on a modal scale | `transition={{ duration: duration.fast, ease: ease.spring }}` | `transition={{ duration: duration.fast, ease: ease.spring }}` on a height change |

---

## Verification Checklist

After making these changes, verify:

1. **Visual parity** — The typewriter animation, chevron rotation, and folder expand/collapse must all look and feel identical to before. No animation should appear faster, slower, or differently eased.

2. **No raw numbers in Framer Motion** — Search `folder-tree.tsx` for `duration:` inside a `transition` prop. It should not contain a raw number literal. It should reference `transitions.*` or `duration.*`.

3. **No string easing aliases** — Search the entire `src/` directory for `ease: "ease`. There should be no Framer Motion string alias (`"easeOut"`, `"easeInOut"`, etc.) anywhere.

4. **Motion tokens in `index.css`** — Search for `--duration-fast`. It should appear once in the primitive `:root` block and in the typewriter animation rules.

5. **Typewriter animation uses tokens** — The `.typewriter-text.typing-in` and `.typing-out` rules must not contain any raw time values (`0.5s`) or raw easing keywords (`ease-out`). They must use `var(--duration-deliberate)` and `var(--ease-out)`.

6. **`motion.ts` exists and exports correctly** — The file must exist at `src/lib/motion.ts` and export `duration`, `ease`, and `transitions`.

7. **Import in `folder-tree.tsx`** — The file must import `transitions` from `@/lib/motion`.

8. **No other files modified** — Run `git diff --name-only`. Only `src/index.css`, `src/lib/motion.ts` (new), and `src/components/folder-tree.tsx` should appear.

---

## What This Change Does NOT Do

- It does not change any visual or animation output. Every animation runs at the same speed with the same feel as before.
- It does not add any new animations to the project.
- It does not modify Tailwind's `transition-colors duration-150` on the folder item button — that is a simple CSS utility transition and is correctly handled by Tailwind's built-in scale.
- It does not address colour tokens, typography, or component API conventions. Those are covered in PRDs 01, 02, and 04.
- It does not implement a `prefers-reduced-motion` media query. That is a future accessibility concern and will be addressed in a dedicated PRD when animation usage is broader.
