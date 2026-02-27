# PRD 01 — Primitive Token Layer

## Purpose of This Document

This document specifies how and why to introduce a **primitive token layer** into the CSS custom property system in `src/index.css`. It is written for an AI coding assistant and should be treated as an authoritative spec. Do not deviate from the structure described here. Read the full document before making any changes.

---

## Context and Rationale

### What is a token layer?

This project uses CSS custom properties (e.g. `--background`, `--primary`) as design tokens. Currently, all semantic tokens are assigned raw HSL values directly:

```css
/* CURRENT — raw values assigned directly to semantic roles */
:root {
  --background: 0 0% 95%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
}
```

This is a **single-tier token system**. It works, but it has a critical weakness: the raw value `0 0% 9%` appears in multiple places with no shared name. If you want to rename it, trace all its usages, or understand what the palette actually is, you have to decode HSL numbers by eye.

A **two-tier token system** separates:

1. **Primitive tokens** — the raw palette. Named by their position on a scale, not by their role. They answer: *what value is this?*
2. **Semantic tokens** — the roles. Named by their purpose in the UI. They answer: *what is this for?* They do not hold raw values — they reference primitives via `var()`.

```
Primitive:  --gray-950: 0 0% 3.9%
Semantic:   --foreground: var(--gray-950)
```

### Why this matters for design system extraction

When this project is eventually extracted into a shared design system:

- The **primitive layer becomes the palette file** — a single source of truth for every colour the system can produce.
- The **semantic layer becomes the theme file** — two versions of it (`:root` and `.dark`) mapping roles to palette values. Swapping a theme means only touching the semantic layer; the primitives never change.
- Debugging a colour mismatch becomes trivial: follow `--background` → `var(--gray-200)` → `0 0% 95%`. The chain of intent is readable.

Without this structure, extraction requires reverse-engineering which raw values are the "same colour" and why — archaeology instead of reading.

---

## Scope

### File to modify

```
src/index.css
```

### Files that must NOT be modified

```
src/components/ui/*.tsx
src/App.tsx
tailwind.config.*
vite.config.*
```

No component files, no Tailwind config, no build config. This change is contained entirely within `index.css`.

---

## Current State (verbatim)

The relevant section of `src/index.css` currently looks like this:

```css
:root {
  --background: 0 0% 95%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 91%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 1.5rem;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 90%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 20.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --sidebar-background: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 0 0% 98%;
  --sidebar-primary-foreground: 240 5.9% 10%;
  --sidebar-accent: 240 3.7% 22%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}
```

---

## Palette Analysis (read before writing the target state)

By inspecting the raw HSL values above, the project uses **three colour families**:

### 1. Neutral Gray (hue 0, saturation 0%)

Used for the main content area — backgrounds, text, borders, cards.

| Step       | HSL value       | Where it appears (current) |
|------------|-----------------|----------------------------|
| gray-0     | 0 0% 100%       | `--card` (light), `--popover` (light) |
| gray-50    | 0 0% 98%        | `--primary-foreground`, `--destructive-foreground`, `--sidebar-background` (light) |
| gray-100   | 0 0% 96.1%      | `--secondary` (light), `--muted` (light) |
| gray-200   | 0 0% 95%        | `--background` (light) |
| gray-300   | 0 0% 91%        | `--accent` (light) |
| gray-400   | 0 0% 89.8%      | `--border` (light), `--input` (light) |
| gray-500   | 0 0% 83.1%      | `--ring` (dark) |
| gray-600   | 0 0% 63.9%      | `--muted-foreground` (dark) |
| gray-700   | 0 0% 45.1%      | `--muted-foreground` (light) |
| gray-800   | 0 0% 20.9%      | `--accent` (dark) |
| gray-850   | 0 0% 14.9%      | `--secondary` (dark), `--muted` (dark), `--border` (dark), `--input` (dark) |
| gray-900   | 0 0% 9%         | `--primary` (light), `--secondary-foreground`, `--accent-foreground` |
| gray-950   | 0 0% 3.9%       | `--foreground` (light), `--background` (dark), `--card` (dark), `--ring` (light) |

### 2. Slate / Blue-Gray (hue ~220–240, low saturation)

Used exclusively for sidebar tokens. Slightly cooler than neutral gray.

| Step        | HSL value          | Where it appears (current) |
|-------------|--------------------|-----------------------------|
| slate-100   | 240 4.8% 95.9%     | `--sidebar-foreground` (dark) |
| slate-200   | 240 4.8% 90%       | `--sidebar-accent` (light) |
| slate-300   | 220 13% 91%        | `--sidebar-border` (light) |
| slate-700   | 240 5.3% 26.1%     | `--sidebar-foreground` (light) |
| slate-800   | 240 3.7% 22%       | `--sidebar-accent` (dark) |
| slate-850   | 240 3.7% 15.9%     | `--sidebar-border` (dark) |
| slate-900   | 240 5.9% 10%       | `--sidebar-primary` (light), `--sidebar-background` (dark) |

### 3. Red (functional, destructive only)

| Step    | HSL value       | Where it appears (current) |
|---------|-----------------|----------------------------|
| red-500 | 0 84.2% 60.2%  | `--destructive` (light) |
| red-800 | 0 62.8% 30.6%  | `--destructive` (dark) |

### 4. Blue (single use, focus rings)

| Step     | HSL value           | Where it appears (current) |
|----------|---------------------|----------------------------|
| blue-400 | 217.2 91.2% 59.8%  | `--sidebar-ring` (both themes) |

---

## Target State

The transformation has two parts:

**Part A** — Add a `:root` block containing only primitive tokens, placed **above** the existing semantic `:root` block.

**Part B** — Replace all raw HSL values in the semantic `:root` and `.dark` blocks with `var(--primitive-name)` references.

### Part A — Primitive token block

Add this block to `index.css` immediately above the existing `:root` block:

```css
/* =============================================================================
   PRIMITIVE TOKENS
   The raw colour palette. Named by scale position, not by role.
   These are the only place raw HSL values should live.
   Never reference these directly in components — use semantic tokens instead.
   ============================================================================= */

:root {
  /* Neutral gray — pure achromatic scale */
  --gray-0:   0 0% 100%;
  --gray-50:  0 0% 98%;
  --gray-100: 0 0% 96.1%;
  --gray-200: 0 0% 95%;
  --gray-300: 0 0% 91%;
  --gray-400: 0 0% 89.8%;
  --gray-500: 0 0% 83.1%;
  --gray-600: 0 0% 63.9%;
  --gray-700: 0 0% 45.1%;
  --gray-800: 0 0% 20.9%;
  --gray-850: 0 0% 14.9%;
  --gray-900: 0 0% 9%;
  --gray-950: 0 0% 3.9%;

  /* Slate — blue-tinted gray, used for sidebar surfaces */
  --slate-100: 240 4.8% 95.9%;
  --slate-200: 240 4.8% 90%;
  --slate-300: 220 13% 91%;
  --slate-700: 240 5.3% 26.1%;
  --slate-800: 240 3.7% 22%;
  --slate-850: 240 3.7% 15.9%;
  --slate-900: 240 5.9% 10%;

  /* Red — used exclusively for destructive/error states */
  --red-500: 0 84.2% 60.2%;
  --red-800: 0 62.8% 30.6%;

  /* Blue — used exclusively for focus rings */
  --blue-400: 217.2 91.2% 59.8%;
}
```

### Part B — Semantic token block (updated)

Replace the existing `:root` semantic block and `.dark` block with the following. Every raw HSL value is replaced with a `var()` reference to a primitive:

```css
/* =============================================================================
   SEMANTIC TOKENS — LIGHT THEME
   Maps design roles to primitive values.
   This is what components consume. Change a role here to retheme.
   ============================================================================= */

:root {
  --background:            var(--gray-200);
  --foreground:            var(--gray-950);

  --card:                  var(--gray-0);
  --card-foreground:       var(--gray-950);

  --popover:               var(--gray-0);
  --popover-foreground:    var(--gray-950);

  --primary:               var(--gray-900);
  --primary-foreground:    var(--gray-50);

  --secondary:             var(--gray-100);
  --secondary-foreground:  var(--gray-900);

  --muted:                 var(--gray-100);
  --muted-foreground:      var(--gray-700);

  --accent:                var(--gray-300);
  --accent-foreground:     var(--gray-900);

  --destructive:           var(--red-500);
  --destructive-foreground: var(--gray-50);

  --border:                var(--gray-400);
  --input:                 var(--gray-400);
  --ring:                  var(--gray-950);

  --radius: 1.5rem;

  /* Sidebar */
  --sidebar-background:           var(--gray-50);
  --sidebar-foreground:           var(--slate-700);
  --sidebar-primary:              var(--slate-900);
  --sidebar-primary-foreground:   var(--gray-50);
  --sidebar-accent:               var(--slate-200);
  --sidebar-accent-foreground:    var(--slate-900);
  --sidebar-border:               var(--slate-300);
  --sidebar-ring:                 var(--blue-400);
}

/* =============================================================================
   SEMANTIC TOKENS — DARK THEME
   Same roles, different primitive mappings. Nothing else changes.
   ============================================================================= */

.dark {
  --background:            var(--gray-950);
  --foreground:            var(--gray-50);

  --card:                  var(--gray-950);
  --card-foreground:       var(--gray-50);

  --popover:               var(--gray-950);
  --popover-foreground:    var(--gray-50);

  --primary:               var(--gray-50);
  --primary-foreground:    var(--gray-900);

  --secondary:             var(--gray-850);
  --secondary-foreground:  var(--gray-50);

  --muted:                 var(--gray-850);
  --muted-foreground:      var(--gray-600);

  --accent:                var(--gray-800);
  --accent-foreground:     var(--gray-50);

  --destructive:           var(--red-800);
  --destructive-foreground: var(--gray-50);

  --border:                var(--gray-850);
  --input:                 var(--gray-850);
  --ring:                  var(--gray-500);

  /* Sidebar */
  --sidebar-background:           var(--slate-900);
  --sidebar-foreground:           var(--slate-100);
  --sidebar-primary:              var(--gray-50);
  --sidebar-primary-foreground:   var(--slate-900);
  --sidebar-accent:               var(--slate-800);
  --sidebar-accent-foreground:    var(--slate-100);
  --sidebar-border:               var(--slate-850);
  --sidebar-ring:                 var(--blue-400);
}
```

---

## Rules

### Structure rules

**DO** place the primitive `:root` block above the semantic `:root` block. CSS cascades top-to-bottom; the primitives must be defined before they are referenced.

**DO** keep primitives and semantics in separate, clearly commented blocks. They serve different purposes and should be readable independently.

**DO NOT** merge the primitive block and the semantic block into one. They must remain separate.

**DO NOT** use primitive tokens in component files (`.tsx`). Components must only ever use semantic tokens via Tailwind classes like `bg-background`, `text-foreground`, `border-border`. The primitive layer is for internal CSS wiring only.

### Naming rules

**DO** name primitive tokens by their position on a scale, not by their appearance or role. `--gray-900` is correct. `--dark-gray`, `--almost-black`, `--near-white` are wrong — they describe the value, not the scale position.

**DO** use a numeric suffix that communicates relative lightness: lower numbers are lighter, higher numbers are darker. This is consistent with Tailwind's own scale convention.

**DO NOT** invent new primitive names without a corresponding raw HSL value that actually exists in the palette. If you need a new colour, define it in the primitive block with a real value first.

**DO NOT** rename existing semantic tokens (`--background`, `--primary`, etc.). These names are consumed by Tailwind's `@theme inline` block at the top of `index.css` and by shadcn components. Changing them breaks everything downstream.

### Value rules

**DO** keep raw HSL values exclusively in the primitive block. After this change, no raw HSL values should appear anywhere in the semantic `:root` or `.dark` blocks.

**DO** use the format `H S% L%` (without the `hsl()` wrapper) to stay consistent with the Tailwind v4 convention already in use in this project.

**DO NOT** use the `hsl()` wrapper in token values. The `@theme inline` block in `index.css` wraps values in `hsl()` automatically. Adding it inside the token value produces `hsl(hsl(...))` which is invalid.

---

## Dos and Don'ts — Quick Reference

| Scenario | Correct | Wrong |
|---|---|---|
| Adding a new shade of gray | Add `--gray-450: 0 0% 87%;` to the primitive block | Write `0 0% 87%` directly into a semantic token |
| Changing the light background colour | Change `--background: var(--gray-200)` to `var(--gray-100)` in semantic `:root` | Change the raw value in the primitive block |
| Making all buttons slightly lighter | Update `--primary` in the semantic block | Edit the `--gray-900` primitive (affects everything that uses it) |
| Using a colour in a component | `className="bg-background"` or `className="text-foreground"` | `style={{ background: 'var(--gray-200)' }}` |
| Theming only the sidebar | Change the `--sidebar-*` semantic tokens in `:root` and `.dark` | Create new sidebar-specific primitives |

---

## Verification Checklist

After making these changes, verify the following before committing:

1. **Visual parity** — The site must look identical to before this change in both light and dark mode. This is a refactor, not a restyle. No colour should shift.

2. **No raw values in semantic blocks** — Search `index.css` for any line in the `:root` (semantic) or `.dark` block that contains a raw percentage value (e.g. `45.1%`). There should be none.

3. **All primitives are used** — Every primitive defined in the primitive `:root` block should be referenced by at least one semantic token. If a primitive is defined but unused, remove it.

4. **No `hsl()` wrappers in token values** — Search for `hsl(` inside custom property definitions. There should be none.

5. **`@theme inline` block is unchanged** — The Tailwind mapping block at the top of `index.css` must not be modified. It references semantic tokens and those names have not changed.

6. **Dark mode still works** — Toggle to dark mode in the browser. Every surface, text colour, and border should render correctly.

---

## What This Change Does NOT Do

- It does not change any visual output. This is a pure refactor.
- It does not touch the `@theme inline` Tailwind mapping block.
- It does not affect any component files.
- It does not introduce a new colour or remove an existing one.
- It does not address typography, spacing, motion, or component API conventions. Those are covered in separate PRDs (02 through 05).
