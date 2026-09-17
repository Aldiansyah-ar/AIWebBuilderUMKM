/**
 * contrast.js — WCAG AA contrast validation (GitHub issue #22).
 *
 * Theme colors (`theme.primaryColor`/`accentColor`) can come from the LLM as
 * arbitrary hex values (see doc/FRONTEND_FLOW.md §4), not just the 9 curated
 * presets in templateSelector.js. Text rendered directly on top of those
 * colors (Hero/Navbar/Contact on `primaryColor`) needs a contrast check with
 * a safe fallback instead of assuming white always works.
 */

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** WCAG contrast ratio between two hex colors, from 1 (none) to 21 (max). */
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return 1
  const l1 = relativeLuminance(rgb1)
  const l2 = relativeLuminance(rgb2)
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5

const WHITE = '#ffffff'
const NEAR_BLACK = '#0f172a'

/**
 * Picks a text color (white or near-black) that meets WCAG AA (>=4.5:1)
 * against `bgHex`, preferring white (most theme/brand colors are dark
 * enough for it). Falls back to whichever of the two has the higher ratio
 * if neither reaches AA, so we always improve on assuming white blindly.
 */
export function getAccessibleTextColor(bgHex, { fallback = WHITE } = {}) {
  if (!bgHex) return fallback
  const whiteRatio = getContrastRatio(bgHex, WHITE)
  const darkRatio = getContrastRatio(bgHex, NEAR_BLACK)
  if (whiteRatio >= WCAG_AA_NORMAL_TEXT_RATIO) return WHITE
  if (darkRatio >= WCAG_AA_NORMAL_TEXT_RATIO) return NEAR_BLACK
  return whiteRatio >= darkRatio ? WHITE : NEAR_BLACK
}

export function meetsAA(fgHex, bgHex) {
  return getContrastRatio(fgHex, bgHex) >= WCAG_AA_NORMAL_TEXT_RATIO
}
