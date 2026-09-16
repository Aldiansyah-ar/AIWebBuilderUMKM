import { describe, it, expect } from 'vitest'
import { validateWebsite, getFallback, FALLBACKS } from '../../shared/schema.js'

const VALID = {
  templateId: 'template-fnb',
  theme: { primaryColor: '#9a3412', accentColor: '#fb923c', fontFamily: 'serif' },
  meta: { businessName: 'Warung Kopi Sejahtera', category: 'F&B', tagline: 'Kopi tubruk favorit' },
  hero: { title: 'Ngopi Santai', subtitle: 'Kopi tubruk autentik', ctaText: 'Pesan', ctaWhatsappMessage: 'Halo' },
  about: { story: 'Warung kopi rumahan.', highlights: ['Buka 07:00-22:00'] },
  services: [
    { name: 'Kopi Tubruk', description: 'Kopi hitam', priceEstimate: '12rb' },
    { name: 'Roti Bakar', description: 'Roti bakar', priceEstimate: '15rb' },
    { name: 'Es Kopi Susu', description: 'Kopi susu', priceEstimate: '18rb' },
  ],
  testimonials: [{ customerName: 'Rina', review: 'Mantap!' }],
  contact: { whatsappNumber: '08123456789', address: 'Jl. Raya No.12' },
}

describe('validateWebsite', () => {
  it('accepts a fully valid UMKMWebsiteState', () => {
    expect(validateWebsite(VALID)).toEqual({ valid: true, errors: [] })
  })

  it('rejects non-object input', () => {
    expect(validateWebsite(null).valid).toBe(false)
    expect(validateWebsite('string').valid).toBe(false)
    expect(validateWebsite(undefined).valid).toBe(false)
  })

  it('flags every missing required top-level key', () => {
    const { valid, errors } = validateWebsite({})
    expect(valid).toBe(false)
    for (const key of ['templateId', 'theme', 'meta', 'hero', 'about', 'services', 'contact']) {
      expect(errors).toContain(`missing ${key}`)
    }
  })

  it('rejects an unknown templateId', () => {
    const { valid, errors } = validateWebsite({ ...VALID, templateId: 'template-bogus' })
    expect(valid).toBe(false)
    expect(errors).toContain('templateId enum')
  })

  it('rejects a non-hex primaryColor', () => {
    const bad = { ...VALID, theme: { ...VALID.theme, primaryColor: 'red' } }
    expect(validateWebsite(bad).errors).toContain('theme.primaryColor #RRGGBB')
  })

  it('rejects an out-of-enum fontFamily', () => {
    const bad = { ...VALID, theme: { ...VALID.theme, fontFamily: 'comic-sans' } }
    expect(validateWebsite(bad).errors).toContain('theme.fontFamily enum')
  })

  it('requires at least 3 services', () => {
    const bad = { ...VALID, services: VALID.services.slice(0, 2) }
    expect(validateWebsite(bad).errors).toContain('services min 3')
  })

  it('flags a service item missing a required field', () => {
    const bad = { ...VALID, services: [...VALID.services.slice(0, 2), { name: 'X' }] }
    const { errors } = validateWebsite(bad)
    expect(errors).toContain('services[2].description')
    expect(errors).toContain('services[2].priceEstimate')
  })

  it('does not require testimonials (present-but-empty is fine)', () => {
    expect(validateWebsite({ ...VALID, testimonials: [] }).valid).toBe(true)
  })

  it('rejects testimonials that are not an array', () => {
    const bad = { ...VALID, testimonials: 'not-an-array' }
    expect(validateWebsite(bad).errors).toContain('testimonials array')
  })

  it('requires contact.whatsappNumber and contact.address', () => {
    const bad = { ...VALID, contact: { instagram: '@x' } }
    const { errors } = validateWebsite(bad)
    expect(errors).toContain('contact.whatsappNumber')
    expect(errors).toContain('contact.address')
  })
})

describe('getFallback', () => {
  it('routes F&B-ish categories to the fnb fallback', () => {
    for (const cat of ['Warung Kopi', 'Kuliner Malam', 'Bakso Urat', 'Bisnis FNB Modern']) {
      expect(getFallback(cat)).toBe(FALLBACKS.fnb)
    }
  })

  it('routes retail-ish categories to the retail fallback', () => {
    for (const cat of ['Toko Sembako', 'Retail Fashion', 'Jual Produk']) {
      expect(getFallback(cat)).toBe(FALLBACKS.retail)
    }
  })

  it('defaults unknown categories to services', () => {
    expect(getFallback('Fotografi Pernikahan')).toBe(FALLBACKS.services)
    expect(getFallback('')).toBe(FALLBACKS.services)
  })

  it('every static FALLBACKS entry is itself schema-valid (regression guard)', () => {
    for (const [key, fallback] of Object.entries(FALLBACKS)) {
      const { valid, errors } = validateWebsite(fallback)
      expect(valid, `FALLBACKS.${key} failed: ${errors.join(', ')}`).toBe(true)
    }
  })
})
