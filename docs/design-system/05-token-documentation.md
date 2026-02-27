# PRD 05 — Inline Token and Variant Documentation

## Model and Mode

```
Model:   Claude Opus 4.6
Mode:    Agent
Context: 1M (loads 7 files simultaneously)
```

**Why 1M context:** This PRD touches seven files at once. Loading them all simultaneously ensures the model sees every component at once and writes documentation that is consistent in tone and format across all of them.

**Instruction for Agent mode:**
```
Read @docs/05-token-documentation.md in full before doing anything.
Execute all changes described in the Target State section.
Modify exactly these files:
  - src/index.css
  - src/components/ui/button.tsx
  - src/components/ui/badge.tsx
  - src/components/ui/card.tsx
  - src/components/ui/input.tsx
  - src/components/ui/separator.tsx
  - src/components/ui/sheet.tsx
Touch no other files. Run the verification checklist when done.
```

---

## Purpose of This Document

This document specifies where and how to add inline documentation to the project's token system and component variant exports. It is entirely additive — no logic, no values, no behaviour changes. Only comments are added.

---

## Context and Rationale

### Why inline documentation matters more than external documentation

External documentation (a wiki, a README, a separate spec file) decays. It lives at a distance from the code, gets updated less often than the code itself, and requires a context switch to consult. Inline documentation — comments directly above the thing they describe — is read at the exact moment a decision is being made, inside the editor, with zero friction.

For a design system specifically, inline documentation serves three purposes:

**1. Intent is preserved.** `--accent: var(--gray-300)` tells you nothing about why this colour exists or when to use it. A one-line comment above it answers the question before it is even asked.

**2. Distinction is clarified.** The semantic token system has several groups that are visually similar and easy to confuse. `--muted`, `--secondary`, and `--accent` are all "subdued" colours. Without documentation, the difference between them is inferred from component usage — fragile and inconsistent. With documentation, it is explicit.

**3. Extraction becomes self-documenting.** When the design system is pulled into a shared package, the comments travel with the code. A developer in a new project reading `--ring` for the first time understands its purpose immediately.

### What is currently undocumented

**In `src/index.css`:** The semantic token sections (light and dark themes) have section header comments but no per-token or per-group documentation. Looking at the file today, there is no way to know what `--ring` is for, or why `--border` and `--input` are separate tokens with the same value, or what distinguishes `--muted` from `--accent`.

**In component files:** The `*Variants` exports have no documentation. A developer new to the project looking at `badgeVariants` sees four options (`default`, `secondary`, `destructive`, `outline`) with no guidance on when to use which one.

---

## Scope

### Files to modify

```
src/index.css                        — semantic token group documentation
src/components/ui/button.tsx         — JSDoc on buttonVariants
src/components/ui/badge.tsx          — JSDoc on badgeVariants
src/components/ui/card.tsx           — JSDoc on cardVariants
src/components/ui/input.tsx          — JSDoc on inputVariants
src/components/ui/separator.tsx      — JSDoc on separatorVariants
src/components/ui/sheet.tsx          — JSDoc on sheetVariants
```

### Files that must NOT be modified

```
src/lib/motion.ts             — already documented in PRD 03
src/components/ui/skeleton.tsx
src/components/ui/icon-button.tsx
src/components/ui/cursor.tsx
src/components/ui/tooltip.tsx
src/components/ui/sidebar.tsx
src/App.tsx
src/components/app-sidebar.tsx
src/components/folder-tree.tsx
```

---

## Documentation Standards

Before reading the target state, understand the standards that all documentation in this project must follow.

### Comment format for CSS tokens

Use a short comment **above** each logical group of tokens, not inline on the same line. Two lines maximum. Focus on intent and distinction — not description.

```css
/* CORRECT — explains intent and distinction */
/* De-emphasized surface for inactive areas and skeletons */
--muted: var(--gray-100);
/* De-emphasized text: hints, placeholders, secondary labels */
--muted-foreground: var(--gray-700);

/* WRONG — describes what is already obvious from the name */
/* The muted color */
--muted: var(--gray-100);
/* The muted foreground color */
--muted-foreground: var(--gray-700);

/* WRONG — too long, belongs in a doc file not a CSS comment */
/* Muted is used when you want to create a visual area that is clearly
   less prominent than the main content area but more structured than
   simply reducing opacity. It is distinct from secondary because... */
--muted: var(--gray-100);
```

### JSDoc format for component variants

Use JSDoc `/** */` format directly above the `const *Variants = cva(...)` declaration. Include:
- One sentence describing what the component is for.
- A `@variant` tag for each variant value with a one-line description.
- A `@size` tag for each size value where sizes exist.

```tsx
/**
 * Visual variants for the Foo component.
 * Use Foo for [purpose].
 *
 * @variant default   — [when to use]
 * @variant secondary — [when to use]
 */
const fooVariants = cva(...)
```

The `@variant` and `@size` tags are not standard JSDoc — they are conventions chosen for this project because they are scannable and unambiguous. VS Code renders JSDoc comments in IntelliSense hover popups, so these descriptions appear when a developer hovers over a variant value in their editor.

---

## Target State

### Change 1 — `src/index.css` semantic token documentation

Add inline comments to the semantic `:root` block (light theme). The dark theme `.dark` block does not need per-token comments — the token names and intent are identical, only the values differ. A single note at the top of the `.dark` block is sufficient.

Replace the existing semantic `:root` block with the following. The token values themselves are unchanged — only comments are added:

```css
/* =============================================================================
   SEMANTIC TOKENS — LIGHT THEME
   Maps design roles to primitive values.
   This is what components consume. Change a role here to retheme.
   ============================================================================= */

:root {
  /* Page background — the outermost surface behind all content */
  --background: var(--gray-200);
  /* Default text and icon color — for content rendered on --background */
  --foreground: var(--gray-950);

  /* Elevated container surface — cards, panels, inset content areas.
     Lighter than --background to create visual depth. */
  --card: var(--gray-0);
  --card-foreground: var(--gray-950);

  /* Floating surface — dropdowns, popovers, command menus, tooltips.
     Semantically distinct from --card even when the value is identical.
     Kept separate so floating surfaces can diverge from cards independently. */
  --popover: var(--gray-0);
  --popover-foreground: var(--gray-950);

  /* Main action color — primary buttons, active/selected states, key UI elements */
  --primary: var(--gray-900);
  --primary-foreground: var(--gray-50);

  /* Secondary interactive surface — supporting buttons, tags, chips.
     For actions that assist a primary action, not compete with it. */
  --secondary: var(--gray-100);
  --secondary-foreground: var(--gray-900);

  /* De-emphasized surface and text.
     --muted: background for disabled areas, skeletons, inactive sections.
     --muted-foreground: hint text, placeholders, metadata, secondary descriptions.
     Distinction from --secondary: muted is for non-interactive content; secondary is for interactive elements. */
  --muted: var(--gray-100);
  --muted-foreground: var(--gray-700);

  /* Hover and selection highlight — surface color when an interactive element is hovered or selected.
     NOT a decorative or brand color. Use only for interaction feedback states. */
  --accent: var(--gray-300);
  --accent-foreground: var(--gray-900);

  /* Error and irreversible action color — delete buttons, destructive confirmations, error messages.
     Never repurpose for warnings (warnings should be a separate token when needed). */
  --destructive: var(--red-500);
  --destructive-foreground: var(--gray-50);

  /* Default border color — card edges, dividers, table lines */
  --border: var(--gray-400);
  /* Input field border — currently identical to --border.
     Kept separate so input borders can be styled independently of general borders. */
  --input: var(--gray-400);
  /* Keyboard focus ring — appears on focused interactive elements only.
     Never use as a decorative border or divider. */
  --ring: var(--gray-950);

  --radius: 1.5rem;

  /* Sidebar surface tokens — use the slate family for a subtly cooler sidebar tone.
     These intentionally diverge from the main --background/--foreground to create
     a visual separation between the navigation chrome and the content area. */
  --sidebar-background:           var(--gray-50);
  --sidebar-foreground:           var(--slate-700);
  --sidebar-primary:              var(--slate-900);
  --sidebar-primary-foreground:   var(--gray-50);
  --sidebar-accent:               var(--slate-200);
  --sidebar-accent-foreground:    var(--slate-900);
  --sidebar-border:               var(--slate-300);
  --sidebar-ring:                 var(--blue-400);
}
```

Add a single note to the `.dark` block header:

```css
/* =============================================================================
   SEMANTIC TOKENS — DARK THEME
   Same roles as the light theme. Only the primitive mappings change.
   Token intent and usage rules are identical — see the light theme comments above.
   ============================================================================= */

.dark {
  /* ... all existing token values unchanged ... */
}
```

---

### Change 2 — `src/components/ui/button.tsx`

Add JSDoc above `buttonVariants`:

```tsx
/**
 * Visual variants for the Button component.
 * Button is the primary interactive element for user actions.
 *
 * @variant default     — Filled primary button. Use for the single most important
 *                        action in any given context (submit, confirm, proceed).
 * @variant destructive — For irreversible or dangerous actions (delete, remove, revoke).
 *                        Pair with a confirmation step for actions that cannot be undone.
 * @variant outline     — Secondary action with a visible border. Less prominent than default.
 *                        Use when two actions share equal importance or as a cancel option.
 * @variant secondary   — Muted filled button. For supporting actions that sit alongside a primary.
 * @variant ghost       — No background or border until hovered. For tertiary actions,
 *                        toolbar buttons, or text-adjacent interactive elements.
 * @variant link        — Renders as a hyperlink with underline on hover. For navigation
 *                        or inline text actions within prose.
 *
 * @size default — Standard height (h-9). The baseline for all form layouts.
 * @size sm      — Compact (h-8). For dense UIs, table actions, or secondary toolbars.
 * @size lg      — Large (h-10). For prominent CTAs or touch-optimised surfaces.
 * @size icon    — Square (h-10 w-10). For icon-only buttons. Always pair with a Tooltip.
 */
const buttonVariants = cva(
```

---

### Change 3 — `src/components/ui/badge.tsx`

Add JSDoc above `badgeVariants`:

```tsx
/**
 * Visual variants for the Badge component.
 * Badge is a non-interactive label used to communicate status, category, or count.
 * For interactive tags or removable labels, do not use Badge — build a dedicated component.
 *
 * @variant default     — Filled with the primary color. For key status labels, version numbers,
 *                        or counts that need to stand out.
 * @variant secondary   — Muted fill. For informational or neutral labels where prominence
 *                        would compete with surrounding content.
 * @variant destructive — Error or warning state. For labels indicating a problem, failure,
 *                        or item requiring urgent attention.
 * @variant outline     — Border only, transparent background. Lightest visual weight.
 *                        For categorical labels or tags where the badge should recede.
 */
const badgeVariants = cva(
```

---

### Change 4 — `src/components/ui/card.tsx`

Add JSDoc above `cardVariants`:

```tsx
/**
 * Visual variants for the Card component.
 * Card is a container for grouping related content into a distinct visual unit.
 *
 * @variant default — Border, background, and shadow. Standard card appearance.
 *                   Use when the card should read as a clearly separate surface
 *                   from the page background.
 * @variant ghost   — No border, transparent background, no shadow.
 *                   Use when content needs card-like structure (header, content, footer)
 *                   but should not appear as a visually distinct container —
 *                   for example, a section within an already-elevated panel.
 */
const cardVariants = cva(
```

---

### Change 5 — `src/components/ui/input.tsx`

Add JSDoc above `inputVariants`:

```tsx
/**
 * Size variants for the Input component.
 * Input sizes are designed to match Button sizes exactly so that pairing
 * an Input and a Button in the same row always produces consistent heights
 * without custom overrides.
 *
 * @size sm      — Compact height (h-7). Pair with <Button size="sm">.
 *                 For dense forms, filter bars, or inline editing contexts.
 * @size default — Standard height (h-9). Pairs with default Button.
 *                 The baseline for all form layouts.
 * @size lg      — Large height (h-11). Pair with <Button size="lg">.
 *                 For prominent search inputs or touch-optimised forms.
 *
 * Note: The native HTML `size` attribute (character width) is intentionally
 * omitted from InputProps to avoid a type conflict with this size variant.
 * Use CSS width utilities (w-full, w-48, etc.) to control input width instead.
 */
const inputVariants = cva(
```

---

### Change 6 — `src/components/ui/separator.tsx`

Add JSDoc above `separatorVariants`:

```tsx
/**
 * Orientation variants for the Separator component.
 * Separator renders a thin line to visually divide content sections.
 *
 * @variant horizontal — Full-width line (h-[1px] w-full). Use between vertically stacked sections.
 * @variant vertical   — Full-height line (h-full w-[1px]). Use between side-by-side columns.
 *                       Requires the parent to have a defined height for the line to be visible.
 *
 * The `decorative` prop controls accessibility:
 *   decorative=true  (default) — Purely visual. Ignored by screen readers.
 *   decorative=false           — Meaningful division. Announced by screen readers as a separator.
 */
const separatorVariants = cva(
```

---

### Change 7 — `src/components/ui/sheet.tsx`

Add JSDoc above `sheetVariants`:

```tsx
/**
 * Side variants for the Sheet component.
 * Sheet is a panel that slides in from an edge of the viewport, used for
 * navigation drawers, detail panels, filters, or secondary content.
 *
 * @variant right  — Slides in from the right edge (default). Use for detail panels,
 *                   settings drawers, and contextual information.
 * @variant left   — Slides in from the left edge. Use for primary navigation drawers.
 * @variant top    — Slides in from the top edge. Use for notification trays
 *                   or mobile search overlays.
 * @variant bottom — Slides in from the bottom edge. Use for mobile action sheets
 *                   or confirmation dialogs on small screens.
 */
const sheetVariants = cva(
```

---

## Rules

### What to document

**DO** document intent — what the token or variant is *for*, and when to choose it over a similar option.

**DO** document distinctions — when two tokens or variants look similar, the comment should explicitly state the difference. `--border` vs `--input`, `--muted` vs `--secondary`, `ghost` vs `outline` — these are the confusing pairs.

**DO** document constraints — things that should never happen. `--ring` should never be used as a decorative border. `--destructive` should never be repurposed for warnings. These constraints prevent future misuse.

### What not to document

**DO NOT** restate the name. `/* The border color */` above `--border` is noise, not documentation.

**DO NOT** document values. `/* 0 0% 89.8% */` above a token that now uses `var()` is redundant.

**DO NOT** document implementation details of Radix or Tailwind internals in component comments. The JSDoc describes the design intent, not the CSS mechanics.

**DO NOT** add comments to the `.dark` block beyond the section header note. The light theme comments are the source of truth. Duplicating them in dark mode creates maintenance overhead.

### Comment length

**DO** keep CSS token comments to two lines maximum. If the distinction requires more than two lines to explain, the token naming is the problem — rename the token, don't compensate with a paragraph.

**DO** keep JSDoc variant descriptions to one line per variant where possible. Two lines only when a nuance genuinely requires it (as in `@variant ghost` for Card).

### Tone

**DO** write in the imperative: "Use for X", "Pair with Y", "Never use for Z". This is instruction, not description.

**DO NOT** write in the passive: "This is used for X", "Can be paired with Y". It is weaker and longer.

---

## Dos and Don'ts — Quick Reference

| Scenario | Correct | Wrong |
|---|---|---|
| Documenting `--ring` | `/* Keyboard focus ring — appears on focused interactive elements only. Never use as a decorative border. */` | `/* The ring color */` |
| Documenting `ghost` button | `@variant ghost — No background or border until hovered. For tertiary actions...` | `@variant ghost — Ghost variant` |
| Documenting the dark theme | Single header note: "Same roles. Only mappings change. See light theme comments." | Duplicating all comments in the dark block |
| Documenting `--muted` vs `--secondary` | Explicit distinction in the `--muted` comment: "Distinction from --secondary: muted is for non-interactive content..." | Separate isolated comments with no cross-reference |
| Adding a new token later | Add a comment above it following the same format before committing | Add the value and leave documentation for later |

---

## Verification Checklist

After making these changes, verify:

1. **No values changed** — Run `git diff src/index.css` and confirm that only lines starting with `/*` or `*/` are new. No token values (`var(--gray-*)`, `hsl(...)`) should have changed.

2. **No logic changed in components** — Run `git diff src/components/ui/` and confirm that only `/** */` comment blocks were added. No `cva(`, no `cn(`, no `className` values changed.

3. **JSDoc format is correct** — Every `*Variants` export must have a `/** */` block (double-star) immediately above it. Single-star `/* */` comments do not render in VS Code IntelliSense hover — use `/** */`.

4. **VS Code hover works** — Open `button.tsx`, hover over `buttonVariants` in the file, and confirm the JSDoc description appears in the tooltip popup. Repeat for one other component.

5. **Seven files changed, no others** — Run `git diff --name-only` and confirm exactly these files: `src/index.css`, `button.tsx`, `badge.tsx`, `card.tsx`, `input.tsx`, `separator.tsx`, `sheet.tsx`.

6. **Site still renders correctly** — Comments cannot break rendering, but confirm the browser shows no errors after saving.

---

## What This Change Does NOT Do

- It does not change any CSS values, component logic, or visual output.
- It does not add documentation to `skeleton.tsx`, `icon-button.tsx`, `cursor.tsx`, `tooltip.tsx`, or `sidebar.tsx`.
- It does not document the primitive token blocks (`/* PRIMITIVE TOKENS */`, `/* TYPOGRAPHY TOKENS */`, `/* MOTION TOKENS */`) — those were documented when they were created in PRDs 01–03.
- It does not document `motion.ts` — that file was documented in PRD 03.
- It does not add documentation to `app-sidebar.tsx`, `folder-tree.tsx`, or `App.tsx` — application code, not system code.
