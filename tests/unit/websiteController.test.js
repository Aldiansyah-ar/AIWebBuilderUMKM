import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateWebsite, reviseWebsite } from '../../src/lib/websiteController.js'

function jsonResponse(body) {
  return { json: async () => body }
}

describe('generateWebsite / reviseWebsite onStep callback (issue #13)', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('generateWebsite fires onStep("composing") before the network call starts', async () => {
    const order = []
    const onStep = vi.fn((step) => order.push(step))
    vi.stubGlobal('fetch', vi.fn(async () => {
      order.push('fetch-started')
      return jsonResponse({ ok: true, data: {} })
    }))

    await generateWebsite('Warung Bakso Pak Slamet', { onStep })

    expect(onStep).toHaveBeenCalledWith('composing')
    expect(order).toEqual(['composing', 'fetch-started'])
  })

  it('reviseWebsite fires onStep("composing") before the network call starts', async () => {
    const order = []
    const onStep = vi.fn((step) => order.push(step))
    vi.stubGlobal('fetch', vi.fn(async () => {
      order.push('fetch-started')
      return jsonResponse({ ok: true, data: {} })
    }))

    await reviseWebsite({}, 'ganti warna jadi biru', [], { onStep })

    expect(onStep).toHaveBeenCalledWith('composing')
    expect(order).toEqual(['composing', 'fetch-started'])
  })

  it('works fine without an onStep callback (optional, backwards compatible)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true, data: { businessName: 'Toko A' } })))

    await expect(generateWebsite('Warung Bakso Pak Slamet')).resolves.toEqual({ ok: true, data: { businessName: 'Toko A' } })
  })
})
