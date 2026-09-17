import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isOriginAllowed } from '../../server/security.js'

describe('isOriginAllowed (issue #20 — CORS/origin allowlist)', () => {
  const originalEnv = process.env.ALLOWED_ORIGIN

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ALLOWED_ORIGIN
    else process.env.ALLOWED_ORIGIN = originalEnv
  })

  describe('when ALLOWED_ORIGIN is not configured', () => {
    beforeEach(() => { delete process.env.ALLOWED_ORIGIN })

    it('allows any origin (dev convenience)', () => {
      expect(isOriginAllowed('https://evil.example.com')).toBe(true)
      expect(isOriginAllowed(undefined)).toBe(true)
    })
  })

  describe('when ALLOWED_ORIGIN is configured', () => {
    beforeEach(() => { process.env.ALLOWED_ORIGIN = 'https://umkm-builder.vercel.app, https://umkm.example.com' })

    it('allows an origin on the allowlist', () => {
      expect(isOriginAllowed('https://umkm-builder.vercel.app')).toBe(true)
      expect(isOriginAllowed('https://umkm.example.com')).toBe(true)
    })

    it('rejects an origin not on the allowlist', () => {
      expect(isOriginAllowed('https://evil.example.com')).toBe(false)
    })

    it('allows requests with no Origin header (curl, server-to-server, same-origin GET)', () => {
      expect(isOriginAllowed(undefined)).toBe(true)
      expect(isOriginAllowed('')).toBe(true)
    })
  })
})
