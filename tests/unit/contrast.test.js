import { describe, it, expect } from 'vitest'
import { getContrastRatio, getAccessibleTextColor, meetsAA } from '../../src/lib/contrast.js'

// GitHub issue #22: theme colors can be arbitrary AI-generated hex values,
// not just the curated presets — text placed on top of them needs a real
// WCAG AA contrast check instead of assuming white always works.
describe('getContrastRatio', () => {
  it('is 21:1 for pure black vs pure white', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })

  it('is 1:1 for identical colors', () => {
    expect(getContrastRatio('#452821', '#452821')).toBeCloseTo(1, 5)
  })

  it('is symmetric regardless of argument order', () => {
    expect(getContrastRatio('#1e40af', '#ffffff')).toBeCloseTo(getContrastRatio('#ffffff', '#1e40af'), 5)
  })
})

describe('getAccessibleTextColor', () => {
  it('picks white text for a dark preset brand color (Modern Warm chocolate)', () => {
    expect(getAccessibleTextColor('#452821')).toBe('#ffffff')
  })

  it('picks dark text for a light/pastel AI-generated background', () => {
    const bg = '#fef3c7' // light amber pastel — white text would fail AA here
    const chosen = getAccessibleTextColor(bg)
    expect(chosen).toBe('#0f172a')
    expect(meetsAA(chosen, bg)).toBe(true)
  })

  it('always returns a color that meets AA against the background when either option can', () => {
    const backgrounds = ['#452821', '#92400e', '#2d4a22', '#1e40af', '#0f172a', '#065f46', '#6d28d9', '#9f1239', '#18181b', '#fbbf24', '#a3e635']
    for (const bg of backgrounds) {
      const chosen = getAccessibleTextColor(bg)
      const whiteOk = meetsAA('#ffffff', bg)
      const darkOk = meetsAA('#0f172a', bg)
      if (whiteOk || darkOk) {
        expect(meetsAA(chosen, bg)).toBe(true)
      }
    }
  })
})
