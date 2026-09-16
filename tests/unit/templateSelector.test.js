import { describe, it, expect } from 'vitest'
import {
  determineTemplate,
  formatWhatsappNumber,
  isValidWhatsappNumber,
  generateWhatsappUrl,
  TEMPLATE_FNB,
  TEMPLATE_SERVICES,
  TEMPLATE_RETAIL,
} from '../../src/lib/templateSelector.js'

describe('determineTemplate (US-06 deterministic category detection)', () => {
  it('detects F&B from kuliner keywords', () => {
    expect(determineTemplate('Warung Bakso Pak Slamet, jual bakso urat')).toBe(TEMPLATE_FNB)
    expect(determineTemplate('Kedai Kopi Sejahtera')).toBe(TEMPLATE_FNB)
  })

  it('detects Retail from product keywords', () => {
    expect(determineTemplate('Toko Sembako Berkah')).toBe(TEMPLATE_RETAIL)
    expect(determineTemplate('Distro Baju Anak Muda')).toBe(TEMPLATE_RETAIL)
  })

  it('detects Services from jasa/konsultasi keywords', () => {
    expect(determineTemplate('Jasa Konsultasi Bisnis UMKM')).toBe(TEMPLATE_SERVICES)
  })

  it('prioritizes service phrases over product-looking substrings', () => {
    // "cuci sepatu" contains "sepatu" (a retail keyword) but is a service.
    expect(determineTemplate('CleanKicks Laundry Sepatu, jasa cuci sepatu premium')).toBe(TEMPLATE_SERVICES)
    expect(determineTemplate('Barbershop Gentleman Cut, potong rambut pria')).toBe(TEMPLATE_SERVICES)
  })

  it('defaults to Services for empty or unrecognized input', () => {
    expect(determineTemplate('')).toBe(TEMPLATE_SERVICES)
    expect(determineTemplate('Sebuah usaha yang unik dan berbeda')).toBe(TEMPLATE_SERVICES)
  })
})

describe('formatWhatsappNumber', () => {
  it('normalizes a leading 0 to 62', () => {
    expect(formatWhatsappNumber('08123456789')).toBe('628123456789')
  })

  it('leaves a number already starting with 8 (adds 62)', () => {
    expect(formatWhatsappNumber('8123456789')).toBe('628123456789')
  })

  it('strips non-numeric characters before normalizing', () => {
    expect(formatWhatsappNumber('0812-3456-789')).toBe('628123456789')
  })
})

describe('isValidWhatsappNumber / generateWhatsappUrl (US-07 "never breaks the WA button")', () => {
  it('accepts a well-formed Indonesian number', () => {
    expect(isValidWhatsappNumber('08123456789')).toBe(true)
  })

  it('rejects garbage input', () => {
    expect(isValidWhatsappNumber('')).toBe(false)
    expect(isValidWhatsappNumber('123')).toBe(false)
  })

  it('builds a wa.me link with the encoded custom message', () => {
    const url = generateWhatsappUrl('08123456789', 'Halo, mau pesan kopi')
    expect(url).toBe('https://wa.me/628123456789?text=Halo%2C%20mau%20pesan%20kopi')
  })

  it('falls back to "#" for an invalid number instead of building a broken link', () => {
    expect(generateWhatsappUrl('123', 'pesan')).toBe('#')
  })
})
