import { describe, it, expect } from 'vitest'
import { buildStandaloneHtml } from '../../src/lib/exportWebsite.js'

describe('buildStandaloneHtml WhatsApp CTA (issue #18)', () => {
  it('renders a live wa.me link when the number is valid', () => {
    const { html } = buildStandaloneHtml({ contact: { whatsappNumber: '628123456789' } })
    expect(html).toContain('href="https://wa.me/628123456789')
    expect(html).not.toContain('<button type="button" disabled')
  })

  it('renders a real disabled <button>, not a live/broken link, when the number is invalid', () => {
    const { html } = buildStandaloneHtml({ contact: { whatsappNumber: '123' } })
    expect(html).not.toContain('href="https://wa.me/')
    expect(html).not.toContain('aria-disabled')
    expect(html).toContain('<button type="button" disabled')
  })

  it('gates every WhatsApp CTA in the export (header, hero, contact, sticky), not just one', () => {
    const { html } = buildStandaloneHtml({ contact: { whatsappNumber: 'not-a-number' } })
    const disabledButtonCount = (html.match(/<button type="button" disabled/g) || []).length
    expect(disabledButtonCount).toBe(4)
  })
})

describe('buildStandaloneHtml theme.primaryColor (issue #18)', () => {
  it('interpolates a valid hex color as-is', () => {
    const { html } = buildStandaloneHtml({ theme: { primaryColor: '#123abc' } })
    expect(html).toContain('background-color: #123abc')
  })

  it('falls back to the template default instead of injecting an attribute-breakout payload', () => {
    const payload = '#000" onmouseover="alert(1)'
    const { html } = buildStandaloneHtml({ theme: { primaryColor: payload } }, 'template-fnb')
    expect(html).not.toContain(payload)
    expect(html).not.toContain('onmouseover=')
    expect(html).toContain('background-color: #452821')
  })
})
