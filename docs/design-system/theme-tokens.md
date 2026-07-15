# Theme Tokens — cream/pastel system (full spectrum)

Warm cream base, warm near-black ink, a coherent family of soft pastel accents.
Built in three layers:

1. **Semantic UI tokens** — background/surface/text/border. What you theme the app with.
2. **UI accents** — the 4 characterful originals from the board. Pink = action.
3. **Extended accent wheel** — 12 hues cut from ONE recipe (fixed L/S, rotating hue)
   for graphics, charts, categorical data. Includes the violet that was missing.
4. **Warm neutral ramp** — stepped warm grays for fills, strokes, tints, shadows.

Dark mode is NOT an inversion. Backgrounds stay warm (brown in the black, not
charcoal). Pastels desaturate + darken so they don't glow.

---

## 1. Semantic UI tokens

### Light
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FAF4E5` | Page background. Warm cream, the signature. |
| `--surface` | `#F1EBDA` | Cards / panels on bg. |
| `--surface-raised` | `#FFFFFF` | Elevated (fields, score card). |
| `--border` | `#E3DCC9` | Hairline dividers, card edges. |
| `--text` | `#161614` | Primary ink. Warm near-black. |
| `--text-muted` | `#8A857A` | Secondary, captions, metadata. |
| `--text-faint` | `#B4AEA0` | Placeholder, disabled. |

### Dark
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#1A1815` | Warm-black page bg. |
| `--surface` | `#242019` | Cards / panels. |
| `--surface-raised` | `#2E2921` | Elevated surfaces. |
| `--border` | `#3A342B` | Hairline dividers. |
| `--text` | `#F2ECDD` | Primary text, warm off-white. |
| `--text-muted` | `#A39C8C` | Secondary. |
| `--text-faint` | `#6E685B` | Placeholder, disabled. |

---

## 2. UI accents (the characterful originals)

Use these for interface. Keep them as-is; they carry the hand-made charm.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--accent-primary` | `#F4BADB` | `#C98BA8` | Pink. THE action color (FAB, active, primary CTA). |
| `--accent-primary-ink` | `#161614` | `#1A1815` | Ink on the pink (stays dark). |
| `--accent-yellow` | `#F3D86E` | `#C7AE58` | Categorical: butter. |
| `--accent-blue` | `#B6C9E8` | `#8FA3C6` | Categorical: cornflower. |
| `--accent-green` | `#A9AB66` | `#8A8C54` | Categorical: sage. |

---

## 3. Extended accent wheel (graphics / charts / categorical data)

One recipe, 12 hues. Use for data-viz, illustration fills, category tags —
anywhere you need many colors that read as equal siblings. For UI, prefer the
layer-2 accents above.

| Name | Light | Dark |
|---|---|---|
| rose | `#ECACC4` | `#C16788` |
| coral | `#ECB9AC` | `#C17967` |
| amber | `#ECD4AC` | `#C1A067` |
| yellow | `#ECE1AC` | `#C1B267` |
| citron | `#DFECAC` | `#AFC167` |
| green | `#AEECAC` | `#6AC167` |
| teal | `#ACECDF` | `#67C1AF` |
| cyan | `#ACDEEC` | `#67ADC1` |
| blue | `#ACC6EC` | `#678BC1` |
| indigo | `#B5ACEC` | `#7367C1` |
| violet | `#D2ACEC` | `#9D67C1` |
| magenta | `#ECACDF` | `#C167AF` |

Recipe (if you ever need to generate more): light = HSL(hue, 62%, 80%);
dark = HSL(hue, 42%, 58%). Hold S and L, rotate H only.

---

## 4. Warm neutral ramp

Every neutral leans warm (hue ~42, low saturation). Use for fills, strokes,
tints, shadows, disabled states. NEVER introduce a cool gray.

| Token | Hex |
|---|---|
| `--neutral-0` | `#FAF8F5` |
| `--neutral-50` | `#F8F6F2` |
| `--neutral-100` | `#EFECE6` |
| `--neutral-200` | `#E2DED5` |
| `--neutral-300` | `#CAC5B9` |
| `--neutral-400` | `#AAA392` |
| `--neutral-500` | `#8C8573` |
| `--neutral-600` | `#706A5C` |
| `--neutral-700` | `#545045` |
| `--neutral-800` | `#38352E` |
| `--neutral-900` | `#24221E` |
| `--neutral-950` | `#191815` |

---

## Rules that keep the system coherent

- **Pink is action, only.** Tappable + primary = pink. Everything else labels.
- **Warmth is load-bearing.** No cool grays, no pure #000/#FFF/#888. Every
  neutral is warm. A cool gray will look diseased next to the cream.
- **Text on accents stays dark** in both modes. These are light bodies.
- **UI vs graphics:** layer-2 accents for interface, layer-3 wheel for data-viz
  and illustration. Don't mix — the wheel is regularized and slightly less
  characterful by design.
- **Contrast:** `--text-muted` on `--bg` is ~3.9:1 (ok for large/secondary,
  not small body). Use `--text` for anything that must pass AA small.
