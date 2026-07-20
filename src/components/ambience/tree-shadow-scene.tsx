import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * tree-shadow-scene.tsx — the WebGL half of the ambient "tree-shadow" effect.
 *
 * Loaded LAZILY by <AmbienceLayer/>, so three.js only ships in a separate chunk
 * fetched the first time you switch ambience on. Nothing here belongs in main.
 *
 * HOW IT STAYS SUBTLE (learned from the reference site):
 *  - Leaves use an UNLIT PURE-WHITE material. The overlay composites with
 *    `mix-blend-mode: multiply`, where white = identity, so the leaf geometry is
 *    invisible — only the SHADOWS it casts onto the catcher plane tint the page.
 *    (v1 used a lit material, whose shaded side went grey and showed as a blob.)
 *  - The canopy is a WIDE, THIN cloud of MANY SMALL leaves, so the shadow reads
 *    as fine dapple rather than one solid disc.
 *  - The camera looks straight at the plane, so screen ≈ world x/y — easy to aim
 *    the dapple into a corner. <AmbienceLayer/> then blurs + corner-masks the
 *    canvas for the gauzy, fading look (a cheap stand-in for depth-of-field).
 */

// ─────────────────────────── TUNABLES ───────────────────────────
// The values you're most likely to nudge by eye.

/** Leaf clumps, placed UP and to ONE SIDE (screen top-right: +x right, +y up,
 *  +z toward camera). Mirror the x sign to move the canopy to the other corner.
 *  `count` = instanced leaves per clump; more = denser dapple, still one draw call. */
const CANOPY_CLUMPS: ReadonlyArray<{
  position: [number, number, number]
  count: number
  seed: number
}> = [
  { position: [9, 7, 9], count: 280, seed: 11 },
  { position: [14, 3, 6], count: 260, seed: 22 },
  { position: [4, 10, 11], count: 240, seed: 33 },
]

/** How far leaves scatter within a clump. Wide enough that individual
 *  leaf-shadows stay SEPARATE — the gaps between them are what read as dappled
 *  light. A tight overlap just reads as a solid blob. */
const LEAF_SPREAD: [number, number, number] = [24, 19, 10]

/** Leaves are small flat "cards" (a 2-triangle plane), randomly rotated so each
 *  casts a different thin, irregular silhouette — like real foliage, not a ball.
 *  Small + many + well-spread = fine dapple. */
const LEAF_WIDTH = 1.4
const LEAF_HEIGHT = 0.8
const LEAF_MIN_SCALE = 0.4
const LEAF_SCALE_VARIANCE = 0.8

/** How dark the shadows land, per theme. The single most useful knob. Kept low
 *  because the overlay is blurred + masked on top of this. */
const SHADOW_OPACITY_LIGHT = 0.3
const SHADOW_OPACITY_DARK = 0.85

/** Shadow-map resolution. Higher = finer dapple (many small leaves need it). */
const SHADOW_MAP_SIZE = 1024

/** Breeze: a gentle sway (radians), not a full spin. Higher SPEED = slower. */
const BREEZE_SPEED = 6
const BREEZE_AMPLITUDE = 0.22

/** Angled key light (up + front) and a straight-on camera. */
const LIGHT_POSITION: [number, number, number] = [6, 14, 30]
const CAMERA_POSITION: [number, number, number] = [0, 0, 30]

// ─────────────────────────────────────────────────────────────────

/** Tiny deterministic PRNG so a clump's scatter is stable across re-render/HMR. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SceneProps {
  isDark: boolean
  /** When true the render loop freezes (tab hidden) to save battery/CPU. */
  paused: boolean
  /** When true we render a single static frame (no breeze). */
  reducedMotion: boolean
  /** Fired once the WebGL context is up (drives the toggle's loading state). */
  onReady?: () => void
}

/** One clump of instanced leaves that gently sways. Raw instancedMesh — no drei. */
function LeafClump({
  position,
  count,
  seed,
}: {
  position: [number, number, number]
  count: number
  seed: number
}) {
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.InstancedMesh>(null)

  // Scatter once, deterministically, into a wide thin cloud.
  const { matrices, phase } = useMemo(() => {
    const rand = mulberry32(seed)
    const m = new THREE.Matrix4()
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const scl = new THREE.Vector3()
    const list: THREE.Matrix4[] = []
    for (let i = 0; i < count; i++) {
      pos.set(
        (rand() - 0.5) * LEAF_SPREAD[0],
        (rand() - 0.5) * LEAF_SPREAD[1],
        (rand() - 0.5) * LEAF_SPREAD[2],
      )
      // Random 3-D orientation → varied leaf silhouettes (some edge-on, some flat).
      euler.set(
        rand() * Math.PI * 2,
        rand() * Math.PI * 2,
        rand() * Math.PI * 2,
      )
      quat.setFromEuler(euler)
      const s = LEAF_MIN_SCALE + rand() * LEAF_SCALE_VARIANCE
      scl.set(s, s, s)
      m.compose(pos, quat, scl)
      list.push(m.clone())
    }
    return { matrices: list, phase: rand() * Math.PI * 2 }
  }, [count, seed])

  useLayoutEffect(() => {
    const inst = mesh.current
    if (!inst) return
    matrices.forEach((m, i) => inst.setMatrixAt(i, m))
    inst.instanceMatrix.needsUpdate = true
  }, [matrices])

  // The breeze — a slow two-axis sway. When the loop is frozen (paused /
  // reduced-motion 'demand'), useFrame simply doesn't tick, so it holds still.
  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.getElapsedTime()
    g.rotation.z = Math.sin(t / BREEZE_SPEED + phase) * BREEZE_AMPLITUDE
    g.rotation.x =
      Math.cos(t / (BREEZE_SPEED * 1.3) + phase) * BREEZE_AMPLITUDE * 0.6
  })

  return (
    <group ref={group} position={position}>
      <instancedMesh
        ref={mesh}
        // [geometry, material, count] — geometry/material come from the children.
        args={[
          undefined as unknown as THREE.BufferGeometry,
          undefined as unknown as THREE.Material,
          count,
        ]}
        castShadow
      >
        <planeGeometry args={[LEAF_WIDTH, LEAF_HEIGHT]} />
        {/* Unlit pure white → invisible under multiply; only its shadow shows.
            DoubleSide so a leaf casts a shadow whichever way it faces the light. */}
        <meshBasicMaterial color="white" side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
}

/** Everything inside the <Canvas>: lights, catcher plane, canopy. */
function SceneContents({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />

      <directionalLight
        castShadow
        position={LIGHT_POSITION}
        intensity={2}
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-radius={6}
      >
        {/* Shadow frustum — just big enough to hold the canopy + its shadow.
            A tighter box = crisper per-texel shadows (we soften with CSS blur). */}
        <orthographicCamera
          attach="shadow-camera"
          args={[-22, 26, 22, -16, 0.5, 70]}
        />
      </directionalLight>

      {/* Invisible shadow-catcher: only shadow pixels are painted. Faces +Z
          (toward the camera), so screen ≈ world x/y. */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <shadowMaterial
          transparent
          opacity={isDark ? SHADOW_OPACITY_DARK : SHADOW_OPACITY_LIGHT}
        />
      </mesh>

      {CANOPY_CLUMPS.map((clump, i) => (
        <LeafClump
          key={i}
          position={clump.position}
          count={clump.count}
          seed={clump.seed}
        />
      ))}
    </>
  )
}

export default function TreeShadowScene({
  isDark,
  paused,
  reducedMotion,
  onReady,
}: SceneProps) {
  // Render-loop policy = the performance guard:
  //   reduced-motion → 'demand' (one static frame, no breeze)
  //   paused (tab hidden) → 'never' (fully frozen)
  //   otherwise → 'always' (animated)
  const frameloop = reducedMotion ? 'demand' : paused ? 'never' : 'always'

  return (
    <Canvas
      shadows="soft"
      // Low pixel ratio + no AA: the CSS blur hides both, and it's much cheaper.
      dpr={[0.6, 1]}
      frameloop={frameloop}
      camera={{ position: CAMERA_POSITION, fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
      onCreated={() => onReady?.()}
    >
      <SceneContents isDark={isDark} />
    </Canvas>
  )
}
