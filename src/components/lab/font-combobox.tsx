import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { RoughBox } from "@/components/ui/rough-ink"

/**
 * FontCombobox — a hand-drawn text field that also lets you browse the ENTIRE
 * Google Fonts library from the keyboard: click the field and press ↑/↓ to cycle
 * through every family, or type to filter. Each highlighted family is previewed
 * live (the parent loads just that ONE face on demand), so nothing ever tries to
 * download the whole library — only names are held in memory; faces load lazily.
 *
 * The list is rendered in a PORTAL (fixed-positioned under the input) because the
 * field lives inside the pairings carousel, whose `overflow-x-auto` would clip a
 * normally-positioned dropdown. The active row is highlighted imperatively so
 * arrowing never re-renders the ~1900-item list.
 */

interface FontComboboxProps {
  label: string
  /** The applied family name (also what the input shows when closed). */
  value: string
  placeholder: string
  /** The full list of family names to browse (plain strings; no faces loaded). */
  fonts: readonly string[]
  /** roughjs seed for the field's hand-drawn outline. */
  seed: number
  /** Called live as the highlight moves and on commit — the parent applies it. */
  onChange: (family: string) => void
}

const MAX_LIST_HEIGHT = 288 // px — matches max-h-72 on the list.

type Placement = {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

/** Position a fixed popover under (or above) an anchor, within the viewport. */
function computePlacement(anchor: HTMLElement): Placement {
  const rect = anchor.getBoundingClientRect()
  const gap = 6
  const margin = 8
  const belowSpace = window.innerHeight - rect.bottom - margin
  const aboveSpace = rect.top - margin
  const placeAbove = belowSpace < 200 && aboveSpace > belowSpace
  const maxHeight = Math.min(
    MAX_LIST_HEIGHT,
    Math.max(140, (placeAbove ? aboveSpace : belowSpace) - gap),
  )
  return placeAbove
    ? { left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + gap, maxHeight }
    : { left: rect.left, width: rect.width, top: rect.bottom + gap, maxHeight }
}

export function FontCombobox({ label, value, placeholder, fonts, seed, onChange }: FontComboboxProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [filterQuery, setFilterQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [placement, setPlacement] = useState<Placement | null>(null)

  const anchorRef = useRef<HTMLLabelElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const openValueRef = useRef(value)

  const listId = useId()

  // The list to browse: everything when unfiltered, else a case-insensitive
  // substring match. Cheap — these are plain strings, no faces.
  const filtered = useMemo<readonly string[]>(() => {
    const q = filterQuery.trim().toLowerCase()
    return q ? fonts.filter((f) => f.toLowerCase().includes(q)) : fonts
  }, [fonts, filterQuery])

  // Preview the highlighted family live (the parent loads that one face).
  const preview = useCallback((family: string) => onChange(family), [onChange])

  const openList = useCallback(() => {
    openValueRef.current = value
    // Open as a clean search box: the current family stays highlighted in the
    // list (and applied in the specimen), so typing always filters from scratch
    // instead of appending to the committed name.
    setFilterQuery("")
    setDraft("")
    setActiveIndex(Math.max(0, fonts.indexOf(value)))
    setOpen(true)
  }, [value, fonts])

  const close = useCallback(() => {
    setOpen(false)
    setFilterQuery("")
  }, [])

  const commit = useCallback(
    (i: number) => {
      const family = filtered[i]
      if (family) onChange(family)
      close()
    },
    [filtered, onChange, close],
  )

  // Position the portal while open; keep it pinned on scroll / resize.
  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      if (anchorRef.current) setPlacement(computePlacement(anchorRef.current))
    }
    update()
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", schedule, true)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule, true)
      window.removeEventListener("resize", schedule)
    }
  }, [open])

  // Close on a pointer press outside the field and the popover.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t) || popoverRef.current?.contains(t)) return
      close()
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, close])

  // Highlight the active row imperatively + scroll it into view, so cycling
  // never re-renders the (large) list.
  useEffect(() => {
    const ul = listRef.current
    if (!ul) return
    const prev = ul.querySelector('[aria-selected="true"]')
    if (prev) {
      prev.setAttribute("aria-selected", "false")
      prev.classList.remove("bg-muted")
    }
    const el = ul.children[activeIndex] as HTMLElement | undefined
    if (el) {
      el.setAttribute("aria-selected", "true")
      el.classList.add("bg-muted")
      el.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex, filtered, open])

  const move = (dir: 1 | -1) => {
    if (!filtered.length) return
    const next = Math.min(Math.max(activeIndex + dir, 0), filtered.length - 1)
    setActiveIndex(next)
    setDraft(filtered[next]) // show the highlighted name without re-filtering
    preview(filtered[next])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) openList()
        else move(1)
        break
      case "ArrowUp":
        e.preventDefault()
        if (open) move(-1)
        break
      case "Enter":
        e.preventDefault()
        if (open) commit(activeIndex)
        break
      case "Escape":
        if (open) {
          e.preventDefault()
          onChange(openValueRef.current)
          close()
        }
        break
      case "Tab":
        if (open) close()
        break
    }
  }

  // Stable row handlers — read the row's index off the DOM so the memoised list
  // items never need to change when only the highlight moves.
  const handleHover = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    setActiveIndex(Number(e.currentTarget.dataset.index))
  }, [])
  const handlePick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.preventDefault() // keep focus on the input (don't blur → close early)
      commit(Number(e.currentTarget.dataset.index))
    },
    [commit],
  )

  const items = useMemo(
    () =>
      filtered.map((name, i) => (
        <li
          key={name}
          id={`${listId}-${i}`}
          role="option"
          aria-selected="false"
          data-index={i}
          onMouseEnter={handleHover}
          onMouseDown={handlePick}
          className="flex h-8 cursor-pointer items-center truncate px-3 text-sm text-foreground/80"
        >
          {name}
        </li>
      )),
    [filtered, listId, handleHover, handlePick],
  )

  return (
    <label ref={anchorRef} className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="relative block text-border">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered.length ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={open ? draft : value}
          placeholder={placeholder}
          onFocus={openList}
          onClick={() => {
            if (!open) openList()
          }}
          onChange={(e) => {
            setDraft(e.target.value)
            setFilterQuery(e.target.value)
            setActiveIndex(0)
            if (!open) setOpen(true)
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:text-foreground"
        />
        <RoughBox seed={seed} radius={10} inset={2} className="text-border" />
      </span>

      {open &&
        placement &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              left: placement.left,
              width: placement.width,
              top: placement.top,
              bottom: placement.bottom,
              zIndex: 60,
            }}
          >
            <div className="relative rounded-xl bg-background">
              <RoughBox seed={seed + 100} radius={11} inset={2} className="text-border" />
              {filtered.length ? (
                <ul
                  ref={listRef}
                  id={listId}
                  role="listbox"
                  aria-label={label}
                  style={{ maxHeight: placement.maxHeight }}
                  className="relative overflow-y-auto py-1 [scrollbar-width:thin]"
                >
                  {items}
                </ul>
              ) : (
                <p className="relative px-3 py-3 text-sm text-muted-foreground">No matching family.</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </label>
  )
}
