import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateWithRetry } from '../../server/geminiClient.js'

const VALID_WEBSITE = {
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

function geminiHttpResponse(text) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  }
}

function geminiHttpError(status) {
  return { ok: false, status, json: async () => ({}) }
}

describe('generateWithRetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('succeeds on the first attempt when Gemini returns valid JSON', async () => {
    fetch.mockResolvedValueOnce(geminiHttpResponse(JSON.stringify(VALID_WEBSITE)))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result).toEqual({ ok: true, data: VALID_WEBSITE })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('strips ```json fences before parsing (defensive, even though the prompt forbids them)', async () => {
    const fenced = '```json\n' + JSON.stringify(VALID_WEBSITE) + '\n```'
    fetch.mockResolvedValueOnce(geminiHttpResponse(fenced))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result).toEqual({ ok: true, data: VALID_WEBSITE })
  })

  it('retries once on malformed JSON, then succeeds', async () => {
    fetch
      .mockResolvedValueOnce(geminiHttpResponse('this is not JSON'))
      .mockResolvedValueOnce(geminiHttpResponse(JSON.stringify(VALID_WEBSITE)))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result).toEqual({ ok: true, data: VALID_WEBSITE })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries once on a schema-invalid response, then succeeds', async () => {
    const invalid = { ...VALID_WEBSITE, services: [] } // fails "services min 3"
    fetch
      .mockResolvedValueOnce(geminiHttpResponse(JSON.stringify(invalid)))
      .mockResolvedValueOnce(geminiHttpResponse(JSON.stringify(VALID_WEBSITE)))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result).toEqual({ ok: true, data: VALID_WEBSITE })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('gives up after 2 failed attempts (malformed JSON both times)', async () => {
    fetch
      .mockResolvedValueOnce(geminiHttpResponse('not json'))
      .mockResolvedValueOnce(geminiHttpResponse('still not json'))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result.ok).toBe(false)
    expect(typeof result.error).toBe('string')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('treats a non-2xx HTTP status (e.g. 429 quota exceeded) as a failed attempt and retries', async () => {
    fetch
      .mockResolvedValueOnce(geminiHttpError(429))
      .mockResolvedValueOnce(geminiHttpError(429))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/429/)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('treats a network-level rejection as a failed attempt and retries', async () => {
    fetch
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(geminiHttpResponse(JSON.stringify(VALID_WEBSITE)))

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result).toEqual({ ok: true, data: VALID_WEBSITE })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('surfaces a response with no candidates/text as a failure', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })

    const result = await generateWithRetry('fake-key', 'prompt')

    expect(result.ok).toBe(false)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
