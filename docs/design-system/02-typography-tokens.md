# PRD 02 — Typography Tokens

## Model and Mode

```
Model:   Claude Opus 4.6
Mode:    Plan first, then Agent
Context: Standard
```

**Why Plan first:** Unlike PRD 01 which was a mechanical remap, this PRD introduces a type scale — a set of conventions that require judgment. Before executing, the model should present the proposed scale for review. The code changes themselves are then straightforward.

**Instruction for Plan mode:** Read this document in full. Then present the proposed type scale (sizes, weights, and semantic intent for each step) as a table for review. Do not modify any files during plan mode. Wait for explicit approval before switching to agent mode.

---

## Purpose of This Document

This document specifies how to introduce a **typography token system** into `src/index.css`. It formalises the font family as a reusable token, defines a semantic type scale with documented intent for each step, and establishes weight and spacing conventions. It does not change how the site looks today — it codifies decisions that are already implicit in the code and adds the missing structure for steps that will be needed as the project grows.

---

## Context and Rationale

### What is wrong with the current approach

The project currently defines its font in one place and then uses Tailwind's ad-hoc text utilities everywhere else with no documented intent:

```css
/* index.css — font hardcoded in the body rule */
body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

```tsx
// folder-tree.tsx — text-sm used for navigation items
className="text-sm text-sidebar-foreground"

// app-sidebar.tsx — text-sm used for body copy
className="text-sm text-sidebar-foreground/70"

// badge.tsx — text-xs for labels
className="text-xs font-semibold"

// tooltip.tsx — text-xs for tooltips
className="text-xs text-primary-foreground"

// card.tsx — no size set for CardTitle, tracking-tight applied ad-hoc
className="font-semibold leading-none tracking-tight"
```

The problems this creates:

**The font family is a magic string.** `'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif` appears hardcoded once. If it ever needs to change — or if a second font is added — there is no token to update. The string must be hunted down.

**Text sizes carry no semantic meaning.** `text-sm` is used for sidebar navigation, body copy in the footer, button labels, and card descriptions simultaneously. They happen to all be the same size today, but there is no documented reason for that. When the project grows and a content area needs different proportions, there is no scale to reason from.

**There is no heading scale.** The project has no content pages yet, but it will. When the first heading is needed, whoever writes it will pick a size arbitrarily. Without a scale, each heading decision is made in isolation and they accumulate inconsistency.

**Weights are applied by feel.** `font-bold` appears in link classes. `font-semibold` appears in badges and card titles. `font-medium` appears in selected states. None of these are wrong, but they are not documented as intentional — which means future decisions have no reference point.

### Why this matters for design system extraction

When this project is extracted into a shared design system, the typography layer becomes a first-class export: `@bharat/design-system/typography.css`. Every consuming project gets the same font, the same scale, and the same conventions with one import. Without this formalisation, the extraction would require reading through all component files to reverse-engineer what the implicit type scale was — the same archaeology problem as the token layer.

---

## Scope

### Files to modify

```
src/index.css
```

### Files that must NOT be modified

```
src/components/ui/*.tsx
src/components/app-sidebar.tsx
src/components/folder-tree.tsx
src/App.tsx
```

This is a purely additive change to `index.css`. No component file needs to change. The existing `text-sm`, `text-xs` etc. Tailwind classes in components continue to work exactly as before — this PRD does not replace them. It formalises the convention that justifies them.

---

## Current State (verbatim)

### The `@theme inline` block (top of `index.css`)

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-sidebar-background: hsl(var(--sidebar-background));
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### The body rule (inside `@layer base`)

```css
body {
  @apply bg-background text-foreground;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-image: radial-gradient(circle, hsl(var(--border)) 1.4px, transparent 1.4px);
  background-size: 24px 24px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Typography Inventory (what the project currently uses)

This is a complete audit of every text-related class in the codebase as of this writing.

| File | Class(es) used | Purpose |
|------|---------------|---------|
| `folder-tree.tsx` | `text-sm` | Folder navigation item labels |
| `folder-tree.tsx` | `font-medium` | Selected folder item emphasis |
| `app-sidebar.tsx` | `text-sm` | Footer body copy |
| `app-sidebar.tsx` | `font-bold` | Inline link labels |
| `badge.tsx` | `text-xs font-semibold` | Badge labels |
| `tooltip.tsx` | `text-xs` | Tooltip content |
| `button.tsx` | `text-sm font-medium` | Default button label |
| `button.tsx` | `text-xs` | Small button label (size=sm) |
| `card.tsx` (CardTitle) | `font-semibold leading-none tracking-tight` | Card heading |
| `card.tsx` (CardDescription) | `text-sm` | Card supporting text |

**Observation:** The project currently uses only two text sizes — `text-sm` and `text-xs`. There are no headings, no large display text, no body paragraphs yet. The type scale being defined here anticipates what will be needed as content pages are added.

---

## The Type Scale

### How to read this scale

Each step has:
- A **CSS size value** (in `rem`, where `1rem = 16px`)
- A **canonical line-height** — the `leading-*` class that should pair with it by default
- A **canonical weight** — the `font-*` class that represents the default for this step's role
- A **semantic role** — what this step is *for*

This scale maps directly to Tailwind's built-in utilities. No new utility classes need to be created. The value of defining the scale is the documented intent — so every future text decision is made against a reference, not in isolation.

### The scale

| Token name | Size | Line height | Default weight | Semantic role |
|---|---|---|---|---|
| `text-xs` | 0.75rem / 12px | `leading-none` | `font-medium` | Badges, tooltips, metadata chips, timestamp labels, keyboard shortcuts |
| `text-sm` | 0.875rem / 14px | `leading-snug` | `font-normal` | All UI chrome: sidebar items, button labels, input text, form labels, card descriptions, secondary body copy |
| `text-base` | 1rem / 16px | `leading-relaxed` | `font-normal` | Primary body copy in content areas, article paragraphs, descriptions |
| `text-lg` | 1.125rem / 18px | `leading-snug` | `font-normal` | Lead paragraphs, intro text, pull quotes |
| `text-xl` | 1.25rem / 20px | `leading-snug` | `font-semibold` | Card headings, section labels, widget titles |
| `text-2xl` | 1.5rem / 24px | `leading-tight` | `font-semibold` | Subsection headings (h3 equivalent) |
| `text-3xl` | 1.875rem / 30px | `leading-tight` | `font-semibold` | Section headings (h2 equivalent) |
| `text-4xl` | 2.25rem / 36px | `leading-tight` | `font-bold` | Page-level headings (h1 equivalent) |
| `text-5xl` | 3rem / 48px | `leading-none` | `font-bold` | Hero / display text, large feature statements |

### Weight conventions

| Class | Value | When to use |
|---|---|---|
| `font-normal` | 400 | Body copy, secondary text, placeholder text |
| `font-medium` | 500 | Interactive labels (buttons, nav items), selected states, slight emphasis |
| `font-semibold` | 600 | Headings up to `text-3xl`, badge labels, important UI labels |
| `font-bold` | 700 | Page-level headings (`text-4xl`+), inline link text, strong emphasis in body |

### Letter-spacing (tracking) conventions

| Class | Value | When to use |
|---|---|---|
| `tracking-tight` | -0.025em | Headings at `text-2xl` and above — large text reads more naturally compressed |
| `tracking-normal` | 0 | All body and UI text — the default, do not set explicitly |
| `tracking-wide` | 0.025em | All-caps labels, eyebrow text above headings |
| `tracking-wider` | 0.05em | Uppercase abbreviations (e.g. "UI", "API" used as decorative labels) |

**Rule:** Never use `tracking-tight` on text smaller than `text-xl`. The compression that aids readability at large sizes creates density that hurts it at small sizes.

### Line-height (leading) conventions

| Class | Value | When to use |
|---|---|---|
| `leading-none` | 1 | Single-line UI elements: badges, tooltips, buttons. Also display/hero text where line-break rarely occurs |
| `leading-tight` | 1.25 | Large headings (`text-2xl` and above) |
| `leading-snug` | 1.375 | Small headings, subheadings, compact UI labels (`text-sm` in sidebar) |
| `leading-normal` | 1.5 | Default — do not set explicitly |
| `leading-relaxed` | 1.625 | Body copy paragraphs. The extra breathing room aids long-form reading |

---

## Target State

Three changes are made to `index.css`. All are additive or substitutive within the CSS file. No component files change.

### Change 1 — Add `--font-sans` to the `@theme inline` block

Add one line inside the existing `@theme inline` block. Place it **above** the `--color-*` entries so font tokens are grouped at the top of the block:

```css
@theme inline {
  /* Font families */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  /* Colors */
  --color-background: hsl(var(--background));
  /* ... rest of existing entries unchanged ... */
}
```

This registers the `font-sans` Tailwind utility class, backed by the Inter font stack. Adding it here rather than only in `:root` means Tailwind can generate the utility and it participates in the design system's token layer — not just a CSS variable in isolation.

### Change 2 — Update the body rule to consume `--font-sans`

Replace the hardcoded `font-family` declaration in the body rule with `@apply font-sans`:

```css
/* BEFORE */
body {
  @apply bg-background text-foreground;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-image: radial-gradient(circle, hsl(var(--border)) 1.4px, transparent 1.4px);
  background-size: 24px 24px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* AFTER */
body {
  @apply bg-background text-foreground font-sans;
  background-image: radial-gradient(circle, hsl(var(--border)) 1.4px, transparent 1.4px);
  background-size: 24px 24px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

The font stack is now sourced from the token. The output is identical — this is a refactor only.

### Change 3 — Add the typography token block to `:root`

Add a new `/* TYPOGRAPHY TOKENS */` comment section to the primitive `:root` block (the one added in PRD 01, which holds the colour primitives). Place it **after** the colour primitives, before the closing `}`:

```css
/* =============================================================================
   TYPOGRAPHY TOKENS
   Font family, weight, and scale conventions.
   Sizes map to Tailwind's built-in text-* utilities.
   Weights map to Tailwind's built-in font-* utilities.
   These tokens are the reference point for all text decisions in the project.
   ============================================================================= */

:root {
  /* Font family
     Used via: font-sans (Tailwind utility, registered in @theme inline above)
     Direct CSS reference: var(--font-sans) — for non-Tailwind contexts only */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  /* Font weights
     Used via: font-normal, font-medium, font-semibold, font-bold (Tailwind utilities)
     Direct CSS reference: var(--font-weight-*) — for non-Tailwind contexts only */
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* Type scale — semantic intent reference
     These are NOT new CSS properties. They are documentation.
     The actual sizes come from Tailwind's built-in text-* utilities.

     text-xs   (12px) — Badges, tooltips, timestamps, keyboard shortcuts
     text-sm   (14px) — UI chrome: sidebar, buttons, inputs, labels, card descriptions
     text-base (16px) — Primary body copy, article paragraphs
     text-lg   (18px) — Lead paragraphs, intro text
     text-xl   (20px) — Card headings, widget titles, minor section labels
     text-2xl  (24px) — Subsection headings (h3)
     text-3xl  (30px) — Section headings (h2)
     text-4xl  (36px) — Page headings (h1)
     text-5xl  (48px) — Hero / display text

     Pairing guide:
     text-xs   → leading-none,    font-medium
     text-sm   → leading-snug,    font-normal
     text-base → leading-relaxed, font-normal
     text-lg   → leading-snug,    font-normal
     text-xl   → leading-snug,    font-semibold
     text-2xl  → leading-tight,   font-semibold  + tracking-tight
     text-3xl  → leading-tight,   font-semibold  + tracking-tight
     text-4xl  → leading-tight,   font-bold      + tracking-tight
     text-5xl  → leading-none,    font-bold      + tracking-tight
  */
}
```

This block lives in `:root` because it is part of the primitive token layer — these are the raw values that the system is built on. It is separate from the semantic colour tokens.

---

## Rules

### Font family rules

**DO** use `font-sans` class on the body element (via `@apply font-sans`) and let it cascade. Components do not need to set `font-sans` explicitly unless overriding is intentional.

**DO NOT** write the font stack as a string anywhere except inside `--font-sans`. If the font needs to change, the token changes — nothing else.

**DO NOT** use `font-mono` or `font-serif` without first defining them as tokens in the `@theme inline` block. Introducing a second typeface is a deliberate design decision, not a one-off class.

### Size rules

**DO** use `text-sm` for all UI chrome: navigation, buttons, inputs, labels, sidebar content, tooltips, card descriptions. This is the workhorse size for interactive surfaces.

**DO** use `text-base` for body copy and prose — paragraphs you write to be read, not UI labels.

**DO NOT** use `text-xs` for anything other than badges, tooltips, timestamps, and keyboard shortcut indicators. It is too small for body or label text and should be used sparingly.

**DO NOT** mix sizes within the same conceptual element without intent. A card title and card description using two different sizes is intentional (visual hierarchy). A sidebar label and its subtext using two different sizes must also be intentional — not incidental.

**DO NOT** use `text-lg` or larger for any UI chrome (sidebar, buttons, navigation). Those sizes are for content, not interface.

### Weight rules

**DO** pair `font-bold` only with `text-4xl` and above, or with inline link text where the weight is the primary indicator of interactivity. Do not use `font-bold` on body copy.

**DO** use `font-medium` for interactive states — navigation items, selected states, button labels. It signals "this is interactive" without the heaviness of semibold.

**DO NOT** use `font-semibold` on body copy (text at `text-base` or below, not in a heading context). It creates a dense, aggressive reading experience at paragraph scale.

### Tracking rules

**DO** add `tracking-tight` to every heading at `text-2xl` and above. Large text optically spaces out and needs to be pulled together.

**DO NOT** add `tracking-tight` to anything `text-xl` or smaller. It makes small text harder to read.

**DO NOT** add `tracking-wide` or `tracking-wider` to lowercase text. These are for uppercase/small-caps label contexts only.

### Leading rules

**DO** add `leading-relaxed` to any block of body copy longer than one line. The extra line height makes paragraphs significantly more readable.

**DO NOT** add `leading-relaxed` to single-line UI elements like buttons, badges, or nav items. It adds unwanted vertical space to elements that are sized around their content.

---

## Dos and Don'ts — Quick Reference

| Scenario | Correct | Wrong |
|---|---|---|
| Writing a page heading | `text-4xl font-bold leading-tight tracking-tight` | `text-4xl` alone (missing pairing) |
| Writing a sidebar nav item | `text-sm font-normal` (or `font-medium` if selected) | `text-base` (too large for UI chrome) |
| Writing a badge | `text-xs font-semibold` | `text-sm font-semibold` (too large, loses badge quality) |
| Writing body copy | `text-base font-normal leading-relaxed` | `text-sm` (too small for prose) |
| Changing the font | Update `--font-sans` in `:root` and `@theme inline` | Find/replace the font string across files |
| Writing a section heading | `text-3xl font-semibold leading-tight tracking-tight` | `text-2xl font-bold` (wrong pairing for h2 level) |
| Adding a tooltip | `text-xs` (default weight is fine) | `text-sm` (tooltips should be clearly smaller than surrounding text) |
| Writing a card title | `text-xl font-semibold leading-snug` | `font-semibold leading-none tracking-tight` without a size class (relies on inherited size, unpredictable) |

---

## Verification Checklist

After making these changes, verify the following:

1. **Visual parity** — The site must look identical to before. No text should change size, weight, or spacing. Both light and dark modes must be confirmed.

2. **`font-sans` in `@theme inline`** — Search `index.css` for `--font-sans`. It should appear twice: once in `@theme inline` (the Tailwind registration) and once in `:root` (the primitive token for non-Tailwind reference).

3. **No hardcoded font string in `body`** — Search `index.css` for `font-family`. It should not appear anywhere except inside the `--font-sans` token definitions.

4. **`@apply font-sans` in body rule** — Confirm the body rule inside `@layer base` contains `@apply bg-background text-foreground font-sans`.

5. **Typography token block is in `:root`** — The `/* TYPOGRAPHY TOKENS */` section must be inside the primitive `:root` block, not inside the semantic `:root` block or the `.dark` block.

6. **No component files modified** — Run `git diff` and confirm no `.tsx` files appear in the diff.

7. **Font renders correctly in browser** — Open DevTools, inspect any text node, and confirm the computed font-family is `Inter` (or the system fallback if Inter is not loaded). Confirm font-smoothing is still applied.

---

## What This Change Does NOT Do

- It does not change any visual output. This is a pure refactor plus additive documentation.
- It does not add new Tailwind utilities beyond `font-sans`.
- It does not touch any component files.
- It does not load the Inter font — Inter is already used via the system stack. Loading it from a CDN or variable font is a separate decision for a future PRD.
- It does not address colour tokens, motion tokens, or component API conventions. Those are covered in PRDs 01, 03, and 04.
- It does not create any new CSS classes or selectors beyond what is defined in `@theme inline`.
