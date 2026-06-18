import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  TILE_W,
  TILE_H,
  gridOrigin,
  screenToTile,
  tileToScreen,
  visibleTileRange,
  tileKey,
  type TileRange,
} from "@/lib/iso"

/**
 * Hover fade timings (ms). The fill is instant and the fade-out is slow, so a
 * moving cursor leaves a lingering "snake" trail of lit tiles behind it.
 */
const FADE_IN_MS = 0 // immediate fill
const FADE_OUT_MS = 400 // slow leave → visible trail

/**
 * Fade-out easing for the hover trail. Ease-in (slow start, late drop-off) keeps
 * a tile near full brightness for most of its life, then falls away quickly at
 * the end — so the trail reads as a snake body that vanishes at the tail rather
 * than a quick wisp. Fills are instant, so this curve only ever shapes fade-outs.
 */
const fadeEase = (t: number) => t * t * t

/** Radial edge-fade stops, as a fraction of the canvas half-size. Tuned so the
 *  grid fills the viewport and only softens toward the corners. */
const FADE_INNER = 0.5 // within this radius the grid is fully visible
const FADE_OUTER = 1.0 // beyond this radius the grid is fully erased

/** Idle "breathing" pulse: once the pointer rests on a tile for this long (ms),
 *  its fill starts to pulse slowly. Any pointer movement resets it. */
const BREATH_DELAY_MS = 2000
/** Duration of one full breath (ms) — slow and calm. */
const BREATH_PERIOD_MS = 2000
/** Dimmest point of the breath, as a fraction of the resting fill. */
const BREATH_MIN = 0.4

interface Tween {
  /** Alpha at the moment the tween started. */
  from: number
  /** Target alpha (1 = filled, 0 = empty). */
  to: number
  /** performance.now() when the tween started. */
  start: number
  /** Duration in ms. */
  duration: number
}

interface IsometricGridProps {
  className?: string
}

/**
 * IsometricGrid — the interactive blueprint field behind the home page.
 *
 * A single full-bleed <canvas> drawing an isometric grid of thin rhombus
 * outlines that fills the entire viewport (the tile count is derived from the
 * viewport size on every resize). The tile under the pointer fills instantly
 * with a soft wash and fades back out slowly when the pointer leaves, so a
 * moving cursor leaves a snake-like trail. Rest the pointer on a tile and after
 * a short pause its fill pulses slowly. On touch devices a tap pulses the
 * tapped tile. The field dissolves
 * toward the edges via a radial mask, so it reads as a world larger than the
 * window rather than a boxed-in graphic.
 *
 * Purely decorative: the canvas is aria-hidden and pointer-events-none, so it
 * never intercepts clicks meant for the title/buttons layered above it. Pointer
 * tracking runs on `window`, which keeps it working regardless of stacking.
 *
 * Colors come from the `--iso-line` / `--iso-fill` CSS tokens and are re-read on
 * theme changes, so the grid follows light/dark mode. All motion lives in one
 * requestAnimationFrame loop that idles when nothing is animating and wakes on
 * interaction, resize, or a theme change.
 */
export function IsometricGrid({ className }: IsometricGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const context = el.getContext("2d")
    if (!context) return
    // Non-null aliases so the closures below don't re-widen these to `| null`
    // (TS control-flow narrowing doesn't propagate into nested functions).
    const canvas = el
    const ctx = context

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // ── Mutable state (closure-scoped; never triggers a React re-render) ─────
    /** Active tile tweens, keyed by "tileX,tileY". Settled-empty tiles are GC'd. */
    const tweens = new Map<string, Tween>()
    /** Tap-filled tiles awaiting their automatic fade-out (touch only). */
    const pulses = new Set<string>()
    /** Tile currently under the pointer (hover), or null. */
    let hovered: string | null = null
    /** Resting tile whose fill is slowly pulsing (after BREATH_DELAY_MS idle). */
    let breathKey: string | null = null
    let breathStart = 0
    /** Timer that starts the breath once the pointer goes still. */
    let idleTimer: number | undefined
    let rafId = 0
    let running = false

    let cssWidth = 0
    let cssHeight = 0
    let origin = { x: 0, y: 0 }
    /** Inclusive tile range that covers the viewport; recomputed on resize. */
    let range: TileRange = { minX: 0, maxX: 0, minY: 0, maxY: 0 }

    const colors = { line: "hsl(0 0% 0% / 0.08)", fill: "hsl(0 0% 0% / 0.10)" }

    function readColors() {
      const s = getComputedStyle(canvas)
      const line = s.getPropertyValue("--iso-line").trim()
      const fill = s.getPropertyValue("--iso-fill").trim()
      if (line) colors.line = line
      if (fill) colors.fill = fill
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cssWidth = rect.width
      cssHeight = rect.height
      canvas.width = Math.round(cssWidth * dpr)
      canvas.height = Math.round(cssHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      origin = gridOrigin(cssWidth, cssHeight)
      range = visibleTileRange(cssWidth, cssHeight, origin)
      wake()
    }

    // ── Tween helpers ────────────────────────────────────────────────────────
    function currentAlpha(key: string, now: number): number {
      const tw = tweens.get(key)
      if (!tw) return 0
      let a: number
      if (reduceMotion || tw.duration <= 0) {
        a = tw.to
      } else {
        const t = Math.min(1, (now - tw.start) / tw.duration)
        a = tw.from + (tw.to - tw.from) * fadeEase(t)
      }
      // A resting tile breathes — its fill slowly pulses up and down.
      if (key === breathKey) a *= breathFactor(now)
      return a
    }

    /**
     * Slow breathing multiplier for a resting tile's fill. Starts at 1 (no jump
     * from the resting fill), dips to BREATH_MIN at the half-breath, and returns.
     */
    function breathFactor(now: number): number {
      const phase = (now - breathStart) / BREATH_PERIOD_MS
      const wave = 0.5 + 0.5 * Math.cos(phase * 2 * Math.PI) // 1 → BREATH_MIN → 1
      return BREATH_MIN + (1 - BREATH_MIN) * wave
    }

    function startTween(key: string, to: number, now: number) {
      if (reduceMotion) {
        tweens.set(key, { from: to, to, start: now, duration: 0 })
        return
      }
      const from = currentAlpha(key, now)
      tweens.set(key, {
        from,
        to,
        start: now,
        duration: to > from ? FADE_IN_MS : FADE_OUT_MS,
      })
    }

    function setHovered(key: string | null, now: number) {
      if (key === hovered) return
      if (hovered) startTween(hovered, 0, now) // old tile fades out (keeps breath value)
      if (key) startTween(key, 1, now) // new tile fills in
      hovered = key
      breathKey = null // a new tile resets any in-progress breath
      wake()
    }

    /** Arm the idle countdown that starts a resting tile breathing. */
    function armBreath() {
      if (idleTimer !== undefined) clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        idleTimer = undefined
        if (hovered && !reduceMotion) {
          breathKey = hovered
          breathStart = performance.now()
          wake()
        }
      }, BREATH_DELAY_MS)
    }

    function stopBreath() {
      if (breathKey !== null) {
        breathKey = null
        wake() // redraw without the breath modulation
      }
    }

    function clearIdleTimer() {
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer)
        idleTimer = undefined
      }
    }

    function tap(key: string, now: number) {
      startTween(key, 1, now)
      pulses.add(key) // auto-reverses once filled (see draw)
      wake()
    }

    // ── Pointer → tile ─────────────────────────────────────────────────────
    function tileAt(e: PointerEvent): string | null {
      const rect = canvas.getBoundingClientRect()
      const local = screenToTile(
        e.clientX - rect.left - origin.x,
        e.clientY - rect.top - origin.y
      )
      const tx = Math.round(local.x)
      const ty = Math.round(local.y)
      const inRange =
        tx >= range.minX && tx <= range.maxX && ty >= range.minY && ty <= range.maxY
      return inRange ? tileKey(tx, ty) : null
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return // touch uses tap, not hover
      setHovered(tileAt(e), performance.now())
      // Any movement means "not static": cancel an active breath and restart the
      // idle countdown so the pulse only begins once the pointer rests.
      stopBreath()
      armBreath()
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "touch") return // desktop already hovers
      const key = tileAt(e)
      if (key) tap(key, performance.now())
    }

    function onPointerLeave() {
      setHovered(null, performance.now())
      clearIdleTimer()
    }

    // ── Render ──────────────────────────────────────────────────────────────
    function draw(now: number): boolean {
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      // Auto-reverse tapped tiles once they have finished filling.
      if (pulses.size) {
        for (const key of pulses) {
          const tw = tweens.get(key)
          if (tw && tw.to === 1 && (reduceMotion || now - tw.start >= tw.duration)) {
            startTween(key, 0, now)
            pulses.delete(key)
          }
        }
      }

      ctx.lineWidth = 1
      ctx.strokeStyle = colors.line
      ctx.fillStyle = colors.fill

      let active = false
      const halfW = TILE_W / 2
      const halfH = TILE_H / 2

      for (let ty = range.minY; ty <= range.maxY; ty++) {
        for (let tx = range.minX; tx <= range.maxX; tx++) {
          const s = tileToScreen(tx, ty)
          const cx = origin.x + s.x
          const cy = origin.y + s.y

          // Cull tiles whose diamond is fully outside the viewport.
          if (
            cx + halfW < 0 ||
            cx - halfW > cssWidth ||
            cy + halfH < 0 ||
            cy - halfH > cssHeight
          ) {
            continue
          }

          ctx.beginPath()
          ctx.moveTo(cx, cy - halfH) // top
          ctx.lineTo(cx + halfW, cy) // right
          ctx.lineTo(cx, cy + halfH) // bottom
          ctx.lineTo(cx - halfW, cy) // left
          ctx.closePath()

          const tw = tweens.get(tileKey(tx, ty))
          if (tw) {
            const a = currentAlpha(tileKey(tx, ty), now)
            if (a > 0.001) {
              ctx.globalAlpha = a
              ctx.fill()
              ctx.globalAlpha = 1
            }
            if (!reduceMotion && now - tw.start < tw.duration) {
              active = true // still animating
            } else if (tw.to === 0) {
              tweens.delete(tileKey(tx, ty)) // settled empty → GC
            }
          }

          ctx.stroke() // outline sits on top of the wash
        }
      }

      // Radial edge fade — erase toward the edges so the field dissolves into
      // the page. Scaling to the canvas size makes the mask elliptical, so it
      // fades evenly on all sides regardless of aspect ratio.
      ctx.save()
      ctx.globalCompositeOperation = "destination-out"
      ctx.translate(cssWidth / 2, cssHeight / 2)
      ctx.scale(cssWidth, cssHeight)
      const mask = ctx.createRadialGradient(0, 0, FADE_INNER, 0, 0, FADE_OUTER)
      mask.addColorStop(0, "rgba(0,0,0,0)")
      mask.addColorStop(1, "rgba(0,0,0,1)")
      ctx.fillStyle = mask
      ctx.fillRect(-0.5, -0.5, 1, 1)
      ctx.restore()

      // Keep the loop alive while a tile is breathing (it animates every frame).
      return active || breathKey !== null
    }

    // ── RAF driver (render-on-demand) ────────────────────────────────────────
    function frame() {
      if (draw(performance.now())) {
        rafId = requestAnimationFrame(frame)
      } else {
        running = false
        rafId = 0
      }
    }

    function wake() {
      if (!running) {
        running = true
        rafId = requestAnimationFrame(frame)
      }
    }

    // ── Setup ────────────────────────────────────────────────────────────────
    readColors()
    resize()

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerdown", onPointerDown, { passive: true })
    window.addEventListener("blur", onPointerLeave)
    document.documentElement.addEventListener("pointerleave", onPointerLeave)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const mo = new MutationObserver(() => {
      readColors()
      wake()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      clearIdleTimer()
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("blur", onPointerLeave)
      document.documentElement.removeEventListener("pointerleave", onPointerLeave)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none block h-full w-full", className)}
    />
  )
}
