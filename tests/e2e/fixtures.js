// Shared fixtures + network-mocking helpers for the E2E suite.
//
// Test cases and expected outcomes here are lifted from .SKILL.md
// (§2 Product Backlog, §4 FRD/NFR, §7 Acceptance Demo Matrix) — the BRD/FRD
// is the source of truth, not the current implementation. We still mock
// /api/generate and /api/revise (Playwright's page.route()) rather than
// calling the real Gemini API: the documented flow (§4.1) treats the LLM as
// an external black box that returns a UMKMWebsiteState JSON (§5), and the
// free tier is capped at 20 requests/day (we hit that limit ourselves while
// testing manually) — a live call would make these tests slow, flaky, and
// non-reproducible without changing what's being verified.

/** A UMKMWebsiteState (§5 schema) plausible for TC-01's exact input business. */
export const WARUNG_KOPI_DRAFT = {
  templateId: 'template-fnb',
  theme: { primaryColor: '#9a3412', accentColor: '#fb923c', fontFamily: 'serif' },
  meta: { businessName: 'Warung Kopi Sejahtera', category: 'F&B', tagline: 'Ngopi santai bareng teman' },
  hero: {
    title: 'Ngopi Santai di Warung Kopi Sejahtera',
    subtitle: 'Kopi tubruk dan roti bakar buat nemenin nugas di Surabaya.',
    ctaText: 'Pesan via WhatsApp',
    ctaWhatsappMessage: 'Halo, saya mau pesan kopi',
  },
  about: {
    story: 'Warung kopi rumahan favorit anak muda buat nugas dan santai.',
    highlights: ['Buka 07:00-22:00', 'WiFi kencang'],
  },
  services: [
    { name: 'Kopi Tubruk', description: 'Kopi hitam khas Jawa', priceEstimate: 'Rp12.000' },
    { name: 'Roti Bakar', description: 'Roti bakar coklat keju', priceEstimate: 'Rp15.000' },
    { name: 'Es Kopi Susu', description: 'Kopi susu gula aren', priceEstimate: 'Rp18.000' },
  ],
  testimonials: [{ customerName: 'Budi', review: 'Tempatnya nyaman buat nugas.' }],
  contact: { whatsappNumber: '08123456789', address: 'Surabaya', instagram: '@kopisejahtera' },
}

/** Mock POST /api/generate with a successful LLM response (§4.1: LLM API -> Structured JSON Response). */
export async function mockGenerateSuccess(page, data = WARUNG_KOPI_DRAFT) {
  await page.route('**/api/generate', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data, source: 'llm' }) })
  )
}

/** Mock POST /api/generate failing entirely (§4.2 FR-03: graceful degradation). */
export async function mockGenerateFailure(page) {
  await page.route('**/api/generate', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'llm_failed', fallback: null }) })
  )
}

/**
 * Mock POST /api/revise with a successful LLM response. `onRequest`, if
 * given, is called with the parsed request body so a test can assert on
 * exactly what was sent (issue #6: proving a revision actually reached
 * this route, instead of being silently intercepted by a local/deterministic
 * shortcut before ever hitting the network).
 */
export async function mockReviseSuccess(page, data, onRequest) {
  await page.route('**/api/revise', async (route) => {
    onRequest?.(route.request().postDataJSON())
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) })
  })
}

/** Locator for the sandboxed live preview iframe (US-01: preview panel). */
export function previewFrame(page) {
  return page.frameLocator('iframe[title="Live preview website UMKM"]')
}
