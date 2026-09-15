/**
 * websiteController.js — TSK-01B/02B (Dev 1B): client-side entry point to the
 * backend API routes (see server/index.js). Normalizes both
 * network and "not configured" failures into one shape so callers only need
 * to branch on `ok`, and never talk to Gemini directly (no key in the client
 * bundle).
 */
const REQUEST_TIMEOUT_MS = 20000

async function postJson(url, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    return await res.json()
  } catch (err) {
    return { ok: false, error: 'network', detail: err?.message || String(err) }
  } finally {
    clearTimeout(timer)
  }
}

/** Generate a fresh website draft from a business description (US-05). */
export async function generateWebsite(input) {
  const json = await postJson('/api/generate', { input })
  return json
}

/** Request a chat-based revision against the current website state (US-07/US-08). */
export async function reviseWebsite(current, message) {
  const json = await postJson('/api/revise', { current, message })
  return json
}
