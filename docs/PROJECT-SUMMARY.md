# Portfolio — Project Summary

> Last updated: February 2026.
> This document is the connective tissue of the project — what exists, what's next, and what docs still need to be written.

---

## What This Is

A personal portfolio site for Bharat Nag, deployed at [bharatnag.dev](https://bharatnag.dev) via GitHub Pages.

The site is intentionally structured like a file system: a collapsible sidebar with folders and pages on the left, and a content canvas on the right. Pages are composed of **blocks** — a small set of typed content units (iframe, stats, text, image, video, divider, custom). The system is designed to add new content without touching rendering code.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui (Radix UI) |
| Icons | lucide-react |
| Animation | Framer Motion (page transitions) + CSS (content entrance) |
| Markdown | react-markdown + remark-gfm |
| Routing | Hash-based (`#/path`) — GitHub Pages compatible |
| Deployment | GitHub Pages via `gh-pages` branch + GitHub Actions |
| Domain | bharatnag.dev |

---

## What Has Been Built

### PRD 01 — Data Model + Sidebar Navigation
- `PageNode` tree data model with `id`, `label`, `slug`, `type: 'page' | 'folder'`, `children`
- Hash-based URL routing (`#/home`, `#/experiments/exp-1`, etc.)
- Sidebar with collapsible folders, active state, keyboard-accessible
- `FolderTreeProvider` context: `selectedPage`, `openFolders`, `toggleFolder`

### PRD 02 — Home Page
- `HomeCanvas` component with name, tagline, divider line, bio, social links
- `FadeInUp` stagger animation applied across the home content

### PRD 03 — State Persistence
- Sidebar folder open/close state persisted to `localStorage`
- Hash URL preserved and restored on page refresh (no more snapping back to Home on reload)

### PRD 04 — Block-Based Data Model Refactor
- `PageNode` now has `blocks?: Block[]` instead of flat fields
- Block union type: `IframeBlock | StatsBlock | TextBlock | ImageBlock | VideoBlock | DividerBlock | CustomBlock`
- Home page data converted to blocks: `custom/home-hero`, `text` (bio), `custom/home-social`
- Experiment 1 has 8 blocks demonstrating every block type
- Helpers unchanged: `findPage`, `collectFolderIds`, `findAncestorFolderIds`

### PRD 05 — ProjectCanvas + Block Renderer *(written, pending agent execution)*
- `ProjectCanvas` — main canvas component, desktop toolbar header + scrollable block column (max-w-xl, px-6)
- `CanvasActions` — icon button group (ExternalLink to iframe URL), rendered in desktop canvas + mobile toolbar
- `BlockRenderer` — exhaustive switch dispatcher, TypeScript-safe
- All 6 standard block renderers: iframe, stats, text, image, video, divider
- `CustomBlockRenderer` — REGISTRY map pattern for custom blocks
- `HomeHero` + `HomeSocial` — custom block components replacing `home-canvas.tsx`
- `home-canvas.tsx` and `project-placeholder.tsx` deleted
- react-markdown + remark-gfm installed as new dependencies

### Animation System *(implemented across PRDs 02–05)*
Two distinct layers that do not overlap:

| Layer | What | How |
|---|---|---|
| Page crossfade | Old page out, new page in | Framer Motion `AnimatePresence`, 200ms opacity |
| Content entrance | Blocks rise and fade in | CSS `FadeInUp` component, 1.4s expo-out |

Stagger formula: `delay(i) = i × 100ms + i×(i-1)/2 × 10ms` (decelerating — early gaps are larger).

### Design System *(documented in `docs/design-system/`)*
- Two-tier CSS custom property token system: primitive tokens → semantic tokens
- Typography scale defined as tokens
- Motion tokens: `--duration-base`, `--ease-out`, etc.
- Component API shape conventions
- Light/dark mode via `[data-theme]` attribute on `:root`

---

## Current Source File Map

```
src/
├── App.tsx                          — Shell: sidebar + canvas + mobile toolbar
├── main.tsx
├── index.css                        — All design tokens + keyframes + animation classes
├── data/
│   └── pages.ts                     — Block types, PageNode tree, all page data
├── lib/
│   ├── motion.ts                    — Framer Motion duration/ease constants
│   └── utils.ts                     — cn() utility
├── hooks/
│   └── use-mobile.ts
└── components/
    ├── canvas.tsx                   — AnimatePresence crossfade → ProjectCanvas
    ├── app-sidebar.tsx              — Sidebar shell with FolderTree
    ├── folder-tree.tsx              — FolderTreeProvider + useFolderTree + tree rendering
    ├── project-canvas.tsx           — Block list renderer + desktop toolbar
    ├── canvas-toolbar.tsx           — CanvasActions (ExternalLink icon button)
    ├── home-canvas.tsx              — TO BE DELETED by PRD 05
    ├── project-placeholder.tsx      — TO BE DELETED by PRD 05
    ├── blocks/
    │   ├── block-renderer.tsx       — Dispatches Block → renderer component
    │   ├── iframe-block.tsx
    │   ├── stats-block.tsx
    │   ├── text-block.tsx           — react-markdown with custom prose components
    │   ├── image-block.tsx
    │   ├── video-block.tsx
    │   ├── divider-block.tsx
    │   ├── custom-block.tsx         — REGISTRY map
    │   └── custom/
    │       ├── home-hero.tsx
    │       └── home-social.tsx
    └── ui/
        ├── button.tsx               — shadcn
        ├── tooltip.tsx              — shadcn
        ├── sidebar.tsx              — shadcn
        ├── badge.tsx                — shadcn
        ├── card.tsx                 — shadcn
        ├── fade-in-up.tsx           — project component (CSS animation wrapper)
        ├── icon-button.tsx
        └── ...
```

---

## Todos — What's Left to Build

Listed roughly in priority order. Each becomes a PRD before any agent runs it.

### Immediate
- **Run PRD 05** — ProjectCanvas + block renderers. All 15 checklist items verified.
- **Typography** — Inter is a placeholder. Choose and load the actual typeface (system font stack vs. Google Fonts vs. variable font). Small PRD.

### Near-term
- **Deployment setup** — Confirm GitHub Actions workflow is correct, Vite `base` config points at `bharatnag.dev`, custom domain DNS is wired. Test a real production build.
- **Real content** — Home hero copy, bio, and social links are real. Experiment 1 is placeholder content. Add at least 1–2 real project pages with actual blocks.
- **Empty state** — What shows in the canvas when no page is selected (folder clicked, not a leaf page). Currently undefined.

### Polish pass
- Hover/focus states on all interactive elements (sidebar items, block links, toolbar buttons)
- iframe loading state — show skeleton while the embed loads
- Error boundary on block renderers — graceful fallback if a block fails to render
- Mobile layout review — full pass on canvas padding, toolbar behavior, sidebar sheet behavior
- `npx tsc --noEmit` — confirm zero errors across all new PRD 05 files

### Future
- **New custom block types** — each is a one-file addition to `src/components/blocks/custom/` + one line in REGISTRY
- **Content authoring** — editing `pages.ts` directly is functional but fragile. Options: structured JSON files per page, markdown frontmatter, or a lightweight local CMS
- **Search / filter** — find pages across the sidebar tree without navigating manually
- **Devbox / visual editor** — longer-term, a way to compose blocks visually

---

## Docs — What Exists and What's Missing

### Exists ✓

| File | What it covers |
|---|---|
| `docs/README.md` | Folder structure + naming conventions |
| `docs/design-system/01-primitive-token-layer.md` | Raw CSS custom properties: color palette, spacing scale |
| `docs/design-system/02-typography-tokens.md` | Font size, line height, weight tokens |
| `docs/design-system/03-motion-tokens.md` | Duration and easing tokens |
| `docs/design-system/04-component-api-shape.md` | How components accept props, variant patterns |
| `docs/design-system/05-token-documentation.md` | Full token reference (all semantic + primitive tokens in one place) |
| `docs/features/canvas/feature-canvas-prd-01-data-model.md` | PageNode tree, hash routing, sidebar |
| `docs/features/canvas/feature-canvas-prd-02-home-page.md` | HomeCanvas, FadeInUp introduction |
| `docs/features/canvas/feature-canvas-prd-03-state-persistence.md` | localStorage folder state + URL preservation |
| `docs/features/canvas/feature-canvas-prd-04-data-model-refactor.md` | Block types, pages.ts refactor |
| `docs/features/canvas/feature-canvas-prd-05-project-canvas.md` | Full block renderer system |
| `docs/motion/content-transition-prd.md` | Animation system — CSS FadeInUp + Framer Motion crossfade |

### Missing — Needs to Be Written

#### `docs/design/design-principles.md`
**Status:** Discussed but never formalized into a doc.

You have strong design preferences that have shaped every decision in this project — they live in your head (and partially in your Claude preferences), but not on disk where an agent can read them.

This doc should cover:
- The core philosophy: intent before output, simplicity as the result of invisible decisions, restraint over novelty
- Specific decisions made in this project: why blocks, why hash routing, why CSS animation over Framer Motion for content, why no Tailwind typography plugin
- Principles for future decisions: when to add a new block type, when not to, how to evaluate a new feature
- Anti-patterns to avoid: dark patterns, gratuitous animation, complexity that doesn't earn its cost

An agent reading this doc before making any UI/UX decision would make far better choices by default.

#### `docs/features/canvas/feature-canvas-prd-06-*.md`
**Status:** Not yet defined. The next PRD after testing PRD 05.

Likely candidates: deployment verification, typography, or the empty state.

#### `docs/content/content-guide.md`
**Status:** Not discussed yet, but needed once real content is being authored.

Should cover: how to add a new project page, what block types are available and when to use each, recommended block sequences for a case study, image sizing and format conventions.

#### `docs/architecture/decisions.md`  *(optional but valuable)*
**Status:** Not discussed. Lightweight ADR (Architecture Decision Record) log.

Each entry: what was decided, what alternatives were considered, and why this one was chosen. Useful when returning to the project after time away and asking "why did we do it this way?"

---

## Working Rules (for AI agents)

1. PRDs only — no direct code changes from Claude in conversation. All code goes through a PRD that the agent in VS Code executes.
2. Model/Mode section is always the first thing in a PRD after the title, in the exact code-block format.
3. Brainstorm before specifying visual or motion decisions.
4. One PRD at a time. Test before writing the next.
5. Agents read both the feature PRD and any referenced spec docs (e.g. `content-transition-prd.md`) before touching any file.
6. `npx tsc --noEmit` is always part of the verification checklist.
