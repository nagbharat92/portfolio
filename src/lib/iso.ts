/**
 * Isometric projection math — pure, framework-free helpers for the home grid.
 *
 * The home page renders a field of diamond (rhombus) tiles that fills the whole
 * viewport. Every tile lives at an integer coordinate (tileX, tileY); its
 * on-screen position is a fixed 2:1 isometric projection of that coordinate.
 * These functions are the single source of truth for converting between the two
 * spaces, so the canvas renderer and any future hit-testing (e.g. clicking an
 * object placed on a tile) stay in sync.
 *
 * "Screen space" here is grid-local: (0, 0) is the projected centre of tile
 * (0, 0). The renderer shifts everything by `gridOrigin()` — the viewport
 * centre — so tile (0, 0) sits in the middle and tiles fan out in every
 * direction (including negative coordinates) to cover the screen.
 */

/** Tile diamond width in CSS pixels (kept at a 2:1 ratio with TILE_H). */
export const TILE_W = 120
/** Tile diamond height in CSS pixels. */
export const TILE_H = 60

export interface Point {
  x: number
  y: number
}

/** An inclusive range of tile coordinates. */
export interface TileRange {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * Project a tile coordinate to grid-local screen pixels (the diamond's centre):
 *
 *   screenX = (tileX − tileY) · TILE_W / 2
 *   screenY = (tileX + tileY) · TILE_H / 2
 */
export function tileToScreen(tileX: number, tileY: number): Point {
  return {
    x: (tileX - tileY) * (TILE_W / 2),
    y: (tileX + tileY) * (TILE_H / 2),
  }
}

/**
 * Inverse projection: grid-local screen pixels back to a *fractional* tile
 * coordinate. Round the result to find the tile under a point (each tile's
 * diamond maps to the unit square centred on its integer coordinate). Callers
 * must pass coordinates already offset by `gridOrigin()`.
 */
export function screenToTile(x: number, y: number): Point {
  const a = x / (TILE_W / 2)
  const b = y / (TILE_H / 2)
  return {
    x: (a + b) / 2,
    y: (b - a) / 2,
  }
}

/** The grid origin — the viewport centre, where tile (0, 0) is drawn. */
export function gridOrigin(width: number, height: number): Point {
  return { x: width / 2, y: height / 2 }
}

/**
 * The inclusive range of tile coordinates needed to cover a viewport of the
 * given size, found by inverse-projecting its four corners. `pad` adds a margin
 * of extra tiles so the grid covers the very edges with no gaps.
 */
export function visibleTileRange(
  width: number,
  height: number,
  origin: Point,
  pad = 1
): TileRange {
  const corners = [
    screenToTile(-origin.x, -origin.y),
    screenToTile(width - origin.x, -origin.y),
    screenToTile(-origin.x, height - origin.y),
    screenToTile(width - origin.x, height - origin.y),
  ]
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const c of corners) {
    minX = Math.min(minX, c.x)
    maxX = Math.max(maxX, c.x)
    minY = Math.min(minY, c.y)
    maxY = Math.max(maxY, c.y)
  }
  return {
    minX: Math.floor(minX) - pad,
    maxX: Math.ceil(maxX) + pad,
    minY: Math.floor(minY) - pad,
    maxY: Math.ceil(maxY) + pad,
  }
}

/** Stable string key for a tile, for use as a Map/Set key. */
export function tileKey(tileX: number, tileY: number): string {
  return `${tileX},${tileY}`
}
