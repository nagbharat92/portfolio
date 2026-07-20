import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { DappleParams } from './dapple-params'

/**
 * noise-dapple.tsx — the ambient "tree-shadow" effect, done with PROCEDURAL
 * NOISE instead of 3D geometry.
 *
 * A single full-screen fragment shader paints domain-warped fBm noise, then
 * thresholds it into soft shadow "leaves" with bright gaps (the light coming
 * through). It drifts over time for the breeze. This replaces the old three.js
 * scene entirely — no geometry, no shadow maps, ~a few KB instead of ~230 KB,
 * and every knob maps directly to the LOOK (see DappleParams).
 *
 * Exports:
 *   <NoiseDappleCanvas/> — the raw-WebGL canvas (fills its parent).
 *   <AmbienceOverlay/>    — the fixed, multiply-blended, corner-masked wrapper
 *                            that observes the theme / visibility / reduced-motion.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uResolution;
uniform float uTime;
uniform float uScale;
uniform float uWarp;
uniform float uDensity;
uniform float uSoftness;
uniform float uContrast;
uniform float uDriftSpeed;
uniform vec2  uDriftDir;
uniform float uStrength;
uniform int   uOctaves;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= uOctaves) break;
    v += amp * vnoise(p * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y; // aspect-correct so leaves aren't stretched
  vec2 p = uv * uScale;

  // Drift (the breeze) + a slow secondary sway.
  p += uDriftDir * uTime * uDriftSpeed;

  // Domain warp: bend the coordinates by another noise → organic, non-uniform clumps.
  vec2 q = vec2(fbm(p + vec2(1.7, 9.2)), fbm(p + vec2(8.3, 2.8)));
  p += (q - 0.5) * 2.0 * uWarp;

  float n = fbm(p + 0.12 * vec2(sin(uTime * 0.13), cos(uTime * 0.11)));
  n = clamp((n - 0.5) * uContrast + 0.5, 0.0, 1.0);

  // Threshold into shadow (below) vs. light gaps (above) — the gaps are what
  // read as dappled light through foliage.
  float shade = 1.0 - smoothstep(uDensity - uSoftness, uDensity + uSoftness, n);

  // Black with per-pixel alpha; the overlay's "multiply" turns it into shadow.
  gl_FragColor = vec4(0.0, 0.0, 0.0, shade * uStrength);
}
`

/** Retina cap — we blur anyway, so rendering above this is wasted work. */
const DPR_CAP = 1.25
/** Dark theme multiplies onto an already-dark page, so boost the shadow there. */
const DARK_STRENGTH_MULTIPLIER = 1.8

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[ambience] shader compile failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

interface CanvasProps {
  params: DappleParams
  isDark: boolean
  /** Freeze the render loop (tab hidden). */
  paused: boolean
  /** Hold a single static frame (no drift). */
  reducedMotion: boolean
  className?: string
}

/** The raw-WebGL canvas that renders the dapple. Fills its parent box. */
export function NoiseDappleCanvas({
  params,
  isDark,
  paused,
  reducedMotion,
  className,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Latest props for the render loop to read without re-initialising WebGL.
  const stateRef = useRef({ params, isDark, paused, reducedMotion })

  useEffect(() => {
    stateRef.current = { params, isDark, paused, reducedMotion }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    })
    if (!gl) {
      console.error('[ambience] WebGL unavailable')
      return
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[ambience] program link failed:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    // Fullscreen triangle.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const U = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      scale: gl.getUniformLocation(program, 'uScale'),
      warp: gl.getUniformLocation(program, 'uWarp'),
      density: gl.getUniformLocation(program, 'uDensity'),
      softness: gl.getUniformLocation(program, 'uSoftness'),
      contrast: gl.getUniformLocation(program, 'uContrast'),
      driftSpeed: gl.getUniformLocation(program, 'uDriftSpeed'),
      driftDir: gl.getUniformLocation(program, 'uDriftDir'),
      strength: gl.getUniformLocation(program, 'uStrength'),
      octaves: gl.getUniformLocation(program, 'uOctaves'),
    }

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
      const cw = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const ch = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (cw === w && ch === h) return
      w = cw
      h = ch
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()
    let t = 0
    const frame = (now: number) => {
      const st = stateRef.current
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!st.paused && !st.reducedMotion) t += dt

      resize()
      const p = st.params
      const angle = (p.driftAngle * Math.PI) / 180
      const strength = st.isDark
        ? Math.min(1, p.strength * DARK_STRENGTH_MULTIPLIER)
        : p.strength

      gl.uniform2f(U.resolution, w, h)
      gl.uniform1f(U.time, t)
      gl.uniform1f(U.scale, p.scale)
      gl.uniform1f(U.warp, p.warp)
      gl.uniform1f(U.density, p.density)
      gl.uniform1f(U.softness, Math.max(0.001, p.softness))
      gl.uniform1f(U.contrast, p.contrast)
      gl.uniform1f(U.driftSpeed, p.driftSpeed)
      gl.uniform2f(U.driftDir, Math.cos(angle), Math.sin(angle))
      gl.uniform1f(U.strength, strength)
      gl.uniform1i(U.octaves, Math.round(p.octaves))

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      // NOTE: do NOT call loseContext() here — under React StrictMode the effect
      // is mounted, cleaned up, then remounted, and getContext() would hand back
      // the same *lost* context on remount (every shader compile then fails).
    }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden className={className ?? 'block h-full w-full'} />
  )
}

// ─── Overlay wrapper ─────────────────────────────────────────────────────────

/** True when the site is in dark theme (App.tsx sets html[data-theme]). */
function readDark(): boolean {
  return document.documentElement.dataset.theme === 'dark'
}

/** Fixed-overlay CSS: multiply blend + gauzy blur + a radial corner fade whose
 *  reach is driven by `coverage`. */
function overlayStyle(blur: number, coverage: number): CSSProperties {
  const size = Math.round(120 * coverage)
  const mask = `radial-gradient(${size}% ${size}% at 100% 0%, #000 0%, #000 34%, transparent 72%)`
  return {
    mixBlendMode: 'multiply',
    filter: `blur(${blur}px)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  }
}

/**
 * AmbienceOverlay — the fixed, full-viewport, `pointer-events:none`,
 * multiply-blended, corner-masked wrapper around the dapple canvas. It observes
 * the theme, tab visibility, and reduced-motion itself, so callers only pass
 * `params`.
 */
export function AmbienceOverlay({ params }: { params: DappleParams }) {
  const [isDark, setIsDark] = useState(readDark)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => setIsDark(readDark()))
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-1"
      style={overlayStyle(params.blur, params.coverage)}
    >
      <NoiseDappleCanvas
        params={params}
        isDark={isDark}
        paused={!visible}
        reducedMotion={reducedMotion}
      />
    </div>
  )
}
