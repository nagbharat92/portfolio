import { useCallback, useState } from 'react'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmbienceOverlay } from './noise-dapple'
import { DEFAULT_DAPPLE } from './dapple-params'

/**
 * AmbienceLayer — self-contained ambient "tree-shadow" layer (procedural).
 *
 * Renders:
 *   1. <AmbienceOverlay/> — a fixed, full-viewport, `pointer-events:none`,
 *      multiply-blended canvas that paints drifting leaf-dapple with a fragment
 *      shader (no 3D geometry). It observes the theme / visibility /
 *      reduced-motion itself.
 *   2. An "ambience on/off" toggle (bottom-right).
 *
 * Off by default and persisted to localStorage. Uses DEFAULT_DAPPLE; to tune the
 * look live, see the Ambience experiment page (its control rail drives the same
 * params). To go site-wide later, render <AmbienceLayer/> once in App.tsx.
 */

const LS_ENABLED = 'ambience-enabled'

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === 'true'
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable — ignore */
  }
}

export function AmbienceLayer({ className }: { className?: string }) {
  // Off by default; persisted so a return visitor keeps their choice.
  const [enabled, setEnabled] = useState(() => readBool(LS_ENABLED, false))

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      writeLS(LS_ENABLED, String(next))
      return next
    })
  }, [])

  return (
    <>
      {enabled && <AmbienceOverlay params={DEFAULT_DAPPLE} />}

      {/* Control cluster — its own interactive layer, clear of the top-left
          mobile menu and any top bar. */}
      <div
        className={cn(
          'pointer-events-auto fixed bottom-(--page-inset) right-(--page-inset) z-40 flex items-center gap-2',
          className,
        )}
      >
        <button
          type="button"
          onClick={toggleEnabled}
          aria-pressed={enabled}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            enabled
              ? 'bg-foreground text-background'
              : 'bg-card/90 text-foreground backdrop-blur hover:bg-card',
          )}
        >
          <Leaf className="size-4 shrink-0" />
          {enabled ? 'Ambience on' : 'Ambience off'}
        </button>
      </div>
    </>
  )
}
