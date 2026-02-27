# PRD 04 — Standardize Component API Shape

## Model and Mode

```
Model:   Claude Opus 4.6
Mode:    Agent
Context: Standard
```

**Instruction for Agent mode:**
```
Read @docs/04-component-api-shape.md in full before doing anything.
Execute all changes described in the Target State section.
Modify exactly these files:
  - src/components/ui/card.tsx
  - src/components/ui/input.tsx
  - src/components/ui/separator.tsx
Touch no other files. Run the verification checklist when done.
```

---

## Purpose of This Document

This document specifies how to standardize the API shape of UI components using the CVA (class-variance-authority) pattern already established by `button.tsx`, `badge.tsx`, and `sheet.tsx`. It identifies which components need to adopt CVA, which should not, and why — then provides the exact before and after for each component that changes.

---

## Context and Rationale

### What CVA is and why it matters

CVA (class-variance-authority) is the library this project already uses to define components with explicit variants and sizes. It does two things:

**1. Separates base styles from variant styles.** The base string contains classes that never change. Variants contain classes that apply conditionally based on props. This makes it immediately readable — you can look at a component and know exactly what its range of appearances is, without inferring it from conditionals scattered across the code.

**2. Produces a typed, exportable variants function.** The `buttonVariants` export from `button.tsx` is an example — it can be imported into other components (`icon-button.tsx` uses it via the Button component) and used in non-component contexts. This is the foundation of a composable design system.

### The current inconsistency

Three components use CVA correctly: `button.tsx`, `badge.tsx`, `sheet.tsx`.

Three components have styling logic that belongs in CVA but is expressed differently: `card.tsx` (hardcoded `cn()` strings with no variant structure), `input.tsx` (single hardcoded class string with no size variants), and `separator.tsx` (inline conditional `orientation === "horizontal" ? ... : ...`).

Five components do not need CVA: `skeleton.tsx`, `icon-button.tsx`, `cursor.tsx`, `tooltip.tsx`, `sidebar.tsx`. The reasons are explained in full in the Non-Scope section below.

### Why this matters for design system extraction

When these components are extracted into a shared package, uniformity of API shape is what makes the package usable. A consumer of the design system should be able to pick up any component and know exactly how to discover its variants — because every component exposes a `*Variants` export with the same CVA shape. Without this, some components have typed variant APIs and some have implicit style logic embedded in the component body. The implicit ones are harder to extend, document, and consume.

---

## Complete Component Audit

| Component | CVA status | Action |
|---|---|---|
| `button.tsx` | ✅ CVA with `variant` and `size` | No change |
| `badge.tsx` | ✅ CVA with `variant` | No change |
| `sheet.tsx` | ✅ CVA with `side` | No change |
| `card.tsx` | ❌ Plain `cn()`, no variants | **Add CVA — `variant`** |
| `input.tsx` | ❌ Plain `cn()`, no variants | **Add CVA — `size`** |
| `separator.tsx` | ❌ Inline conditional, no CVA | **Add CVA — `orientation`** |
| `skeleton.tsx` | — Base style only, no variants | Leave as-is (see rationale) |
| `icon-button.tsx` | — Compositional wrapper | Leave as-is (see rationale) |
| `cursor.tsx` | — Dynamic style props | Leave as-is (see rationale) |
| `tooltip.tsx` | — Radix wrapper, complex animation classes | Leave as-is (see rationale) |
| `sidebar.tsx` | — Complex shadcn primitive | Leave as-is (see rationale) |

---

## Non-Scope: Why These Components Should NOT Use CVA

Read this section carefully before executing. Do not add CVA to any of these components.

**`skeleton.tsx`**
The entire component is one base style: `animate-pulse rounded-md bg-primary/10`. There are no variants, no sizes, no conditional styles. CVA on a component with a single variant and no logic is pure ceremony — it adds an import, a variable, and a function call that produce exactly the same output as `cn()`. The rule is: CVA earns its presence when there are at least two things that vary.

**`icon-button.tsx`**
This component does not style anything directly. It wraps `Button` and adds tooltip behaviour. Its appearance is entirely determined by the `Button` component it composes. Adding CVA here would be adding a variant system to a component whose variants are already handled by its child. Composition, not CVA.

**`cursor.tsx`**
This component receives `color` as a runtime prop and applies it via `style={{ backgroundColor: color }}`. The colour is not a design token — it is a dynamic value passed from outside. CVA manages static design-token-based variants. It is not a substitute for dynamic style props. Do not change this component.

**`tooltip.tsx`**
`TooltipContent` wraps a Radix primitive and carries a large block of Radix data-attribute animation classes (`data-[state=closed]:animate-out`, `data-[side=bottom]:slide-in-from-top-2`, etc.). These classes are not variants — they are Radix's state-driven animation bindings. Wrapping them in CVA provides no value and risks mishandling the Radix animation class structure. The component currently has no visual variants and is unlikely to need them. Leave it alone.

**`sidebar.tsx`**
This is the most complex component in the project. It is a direct port of shadcn's sidebar primitive, which is itself built on top of multiple Radix and custom patterns. Do not touch it. It is correct as-is and any structural change risks breaking the sidebar behaviour.

---

## Target State

### Change 1 — `src/components/ui/card.tsx`

**What changes:** The `Card` component (the root element) adopts CVA with a `variant` prop. Sub-components (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) do not need CVA — they are layout slots, not visual variants.

**Why a `ghost` variant now:** Cards will be used in different contexts as the project grows. A `ghost` variant — no border, no shadow, transparent background — is the most predictable second variant for a card. Defining it now means it is available when needed without having to revisit this file.

```tsx
/* BEFORE */
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"
```

```tsx
/* AFTER */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl text-card-foreground",
  {
    variants: {
      variant: {
        default: "border border-border bg-card shadow",
        ghost:   "border-transparent bg-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"
```

The sub-components (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) remain exactly as they are — no changes to them.

Add `cardVariants` to the export at the bottom of the file:

```tsx
/* BEFORE */
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

/* AFTER */
export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

### Change 2 — `src/components/ui/input.tsx`

**What changes:** `Input` adopts CVA with a `size` variant. The HTML `size` attribute on `<input>` elements (which controls character width in legacy forms) conflicts with CVA's `size` variant name — this is resolved by using `Omit` to strip the native `size` attribute from the props type.

**Why sizes now:** Inputs will appear alongside buttons throughout the devbox and editor. `Button` already has `sm`, `default`, and `lg` sizes. `Input` should match so that pairing a button and an input in the same row produces a visually consistent height without custom overrides.

```tsx
/* BEFORE */
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

```tsx
/* AFTER */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm:      "h-7 px-2 py-1 text-xs shadow-none",
        default: "h-9 px-3 py-1 text-sm shadow-sm",
        lg:      "h-11 px-4 py-2 text-base shadow-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
```

**Note on `Omit<React.ComponentProps<"input">, "size">`:** The native HTML `size` attribute on `<input>` accepts a number and controls the visible character width of the field. This is a legacy attribute rarely used in modern development. By omitting it from the props type, we eliminate the TypeScript conflict between `size?: number` (HTML) and `size?: "sm" | "default" | "lg"` (CVA). Any existing usage of the native `size` attribute would need to use the `style` prop or a CSS class instead.

---

### Change 3 — `src/components/ui/separator.tsx`

**What changes:** The inline orientation conditional is moved into CVA. This is the most straightforward change — the conditional logic is directly replaceable with a CVA variant.

```tsx
/* BEFORE */
import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
```

```tsx
/* AFTER */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical:   "h-full w-[1px]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator, separatorVariants }
```

---

## The Standard CVA Shape (reference for all future components)

Every new component added to `src/components/ui/` must follow this shape. This is the canonical pattern.

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants outside the component
const componentVariants = cva(
  "base-classes-that-never-change",
  {
    variants: {
      variant: {
        default: "...",
        secondary: "...",
      },
      size: {
        sm: "...",
        default: "...",
        lg: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 2. Interface extends both HTML props and VariantProps
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

// 3. forwardRef component consumes the variants
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <element
      ref={ref}
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Component.displayName = "Component"

// 4. Export both the component AND the variants function
export { Component, componentVariants }
```

**The `componentVariants` export is not optional.** Even if nothing imports it today, exporting the variants function is what enables future composition — other components can use it to apply the same visual style without wrapping the component itself.

---

## Rules

### When to use CVA

**DO** use CVA when a component has any of the following: two or more visual states that are mutually exclusive, a size scale, a colour/tone variant (default, destructive, ghost, etc.), or conditional styles that currently live in an inline ternary or `cn()` call.

**DO** use CVA even if only one variant exists today, when the component is clearly going to have more. Cards, inputs, and separators are examples: the second variant is predictable.

**DO NOT** use CVA for components whose entire purpose is composition (wrapping other components, adding behaviour without adding style). `icon-button.tsx` is the example.

**DO NOT** use CVA for components whose style is driven by runtime values rather than design tokens. `cursor.tsx` is the example.

**DO NOT** use CVA for components that wrap Radix primitives heavily, unless you are only adding CVA to the specific element you are styling. Do not wrap Radix animation data attributes in CVA variants.

### Variant naming conventions

**DO** name the primary visual variant `variant`. This is the convention established by `button.tsx` and `badge.tsx` and must be consistent across all components.

**DO** name the size variant `size`. This is established by `button.tsx`. Inputs resolve the HTML attribute conflict with `Omit` as shown above — do not rename `size` to `inputSize` or `fieldSize`.

**DO** name orientation, position, and directional variants after what they describe: `orientation`, `side`, `align`, `placement`.

**DO NOT** use adjective-first naming: `darkVariant`, `largeSize`. Variants are the noun, values are the adjectives.

### Default variants

**DO** always define `defaultVariants`. A component without default variants requires the consumer to pass props explicitly for every render, breaking the principle that the component should work out of the box.

**DO** make `default` the value of `variant` in `defaultVariants`. It is the neutral, unsurprising starting point.

### The `cn()` override

**DO** always pass `className` into `cn(componentVariants({ variant, size }), className)`. This preserves the caller's ability to pass one-off overrides. The component's CVA output comes first; the override comes last, winning any conflicts.

**DO NOT** reverse the order: `cn(className, componentVariants(...))`. The caller's override would be overridden by the component's own classes, making the `className` prop useless.

---

## Dos and Don'ts — Quick Reference

| Scenario | Correct | Wrong |
|---|---|---|
| Adding a new card style | Add `elevated: "shadow-lg border-border"` to `cardVariants` | Add a new `ElevatedCard` component |
| Using a card with no border | `<Card variant="ghost">` | `<Card className="border-transparent shadow-none">` (works, but bypasses the system) |
| Using a small input next to a small button | `<Input size="sm" />` and `<Button size="sm" />` | Custom `className` overrides to manually match heights |
| Adding a new component | Follow the canonical shape above, export `componentVariants` | Write `cn("base classes conditional classes")` inline |
| Checking what variants a component supports | Look at the `*Variants` export | Read through the JSX to infer the prop types |
| Changing the ghost card style | Update `cardVariants.variants.variant.ghost` | Find every usage of `<Card variant="ghost">` and update className |

---

## Verification Checklist

After making these changes, verify:

1. **Visual parity** — The site must look identical to before. `card.tsx` default variant must render identically to the old `Card` component. `input.tsx` default size must have the same height (h-9) and padding as before. `separator.tsx` must render identically.

2. **`cardVariants` exported** — `card.tsx` must export `cardVariants`. Search the file for `export { Card, cardVariants`.

3. **`inputVariants` exported** — `input.tsx` must export `inputVariants`. The `Omit<React.ComponentProps<"input">, "size">` pattern must be present in the `InputProps` interface.

4. **`separatorVariants` exported** — `separator.tsx` must export `separatorVariants`. No inline conditional (`? "h-[1px]" : "h-full"`) should remain in the component.

5. **No TypeScript errors** — The project must compile without errors. The `size` prop conflict in `input.tsx` is the most likely source of a TypeScript error if the `Omit` pattern is not applied correctly.

6. **`button.tsx`, `badge.tsx`, `sheet.tsx` unchanged** — Run `git diff` and confirm these files do not appear in the diff.

7. **`skeleton.tsx`, `icon-button.tsx`, `cursor.tsx`, `tooltip.tsx`, `sidebar.tsx` unchanged** — Confirm none of these files appear in the diff.

8. **No new variants used in existing components** — The `ghost` card variant and input `sm`/`lg` sizes are defined but nothing in the existing codebase uses them yet. No existing JSX should have been changed to use them. They are available for future use only.

---

## What This Change Does NOT Do

- It does not change any visual output. All default variants produce the same appearance as before.
- It does not add new usage of the `ghost` card variant or input sizes anywhere in the existing codebase. Those are available for future use.
- It does not touch `button.tsx`, `badge.tsx`, or `sheet.tsx` — they are already correct.
- It does not address colour tokens, typography tokens, motion tokens, or inline token documentation. Those are PRDs 01, 02, 03, and 05.
- It does not touch `sidebar.tsx` under any circumstances.
