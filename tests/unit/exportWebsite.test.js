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

describe('buildStandaloneHtml links (issue #21)', () => {
  it('never emits a bare href="#" placeholder link', () => {
    const { html } = buildStandaloneHtml({})
    expect(html).not.toMatch(/href="#"/)
  })

  it('nav links point at real in-page section ids, not dead anchors', () => {
    const { html } = buildStandaloneHtml({})
    for (const id of ['hero', 'services', 'about', 'contact']) {
      expect(html).toContain(`href="#${id}"`)
      expect(html).toContain(`id="${id}"`)
    }
  })
})

describe('buildStandaloneHtml metadata (issue #29)', () => {
  it('includes Open Graph tags derived from the business content', () => {
    const { html } = buildStandaloneHtml({
      meta: { businessName: 'Toko Sejahtera' },
      hero: { subtitle: 'Produk lengkap harga bersahabat' },
    })
    expect(html).toContain('property="og:title"')
    expect(html).toContain('property="og:description"')
    expect(html).toContain('Toko Sejahtera')
    expect(html).toContain('Produk lengkap harga bersahabat')
  })

  it('inlines a favicon as a data URI (works standalone, no bundled file needed)', () => {
    const { html } = buildStandaloneHtml({})
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,/)
  })
})

describe('buildStandaloneHtml LocalBusiness schema + Maps embed (issue #30)', () => {
  it('embeds a schema.org LocalBusiness JSON-LD block', () => {
    const { html } = buildStandaloneHtml({
      meta: { businessName: 'Toko Sejahtera' },
      contact: { address: 'Jl. Merdeka No. 1' },
    })
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"LocalBusiness"')
    expect(html).toContain('Toko Sejahtera')
  })

  it('escapes </script> in JSON-LD so business-controlled content cannot break out of the script tag', () => {
    const payload = '</script><script>alert(1)</script>'
    const { html } = buildStandaloneHtml({ meta: { businessName: payload } })
    // The raw payload must never appear literally — every `<` in it has to
    // be replaced (browsers' HTML parser only cares about `<`, not `>`, to
    // recognize a closing </script> tag).
    expect(html).not.toContain(payload)
    expect(html).not.toContain('</script><script>')
    expect(html).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>')
  })

  it('embeds a Google Maps iframe when an address is present, omits it otherwise', () => {
    const withAddress = buildStandaloneHtml({ contact: { address: 'Jl. Merdeka No. 1' } }).html
    expect(withAddress).toContain('google.com/maps?q=')

    const withoutAddress = buildStandaloneHtml({ contact: {} }).html
    expect(withoutAddress).not.toContain('google.com/maps')
  })
})

describe('buildStandaloneHtml CTA click tracking (issue #31)', () => {
  it('tags every live WhatsApp CTA for tracking, and only the live ones', () => {
    const valid = buildStandaloneHtml({ contact: { whatsappNumber: '628123456789' } }).html
    expect((valid.match(/data-cta-track="/g) || []).length).toBe(4)

    // The tracking <script>'s own querySelector('[data-cta-track]') literal
    // is always present — check the *attribute* form is absent, not the
    // bare substring.
    const invalid = buildStandaloneHtml({ contact: { whatsappNumber: 'not-a-number' } }).html
    expect(invalid).not.toContain('data-cta-track="')
  })

  it('only fires gtag/fbq if the user has actually installed them', () => {
    const { html } = buildStandaloneHtml({})
    expect(html).toContain("typeof window.gtag === 'function'")
    expect(html).toContain("typeof window.fbq === 'function'")
  })
})
