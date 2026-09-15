/**
 * geminiClient.js — Dev 1B backend: raw Gemini call + retry-once orchestration.
 * Server-only (uses the un-prefixed GEMINI_API_KEY); never imported by src/.
 */
import { validateWebsite } from '../shared/schema.js'

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const REQUEST_TIMEOUT_MS = 15000
const MAX_ATTEMPTS = 2 // 1 initial call + 1 retry, per TSK-02B

function stripJsonFences(text = '') {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
}

async function callGeminiOnce(apiKey, promptText) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`)
    }
    const json = await res.json()
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) throw new Error('Gemini response missing text')
    return JSON.parse(stripJsonFences(rawText))
  } finally {
    clearTimeout(timer)
  }
}

/** Retry-once orchestration (TSK-02B): auto-retry 1x on failure, validate schema, else signal failure. */
export async function generateWithRetry(apiKey, promptText) {
  let lastError = null
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const data = await callGeminiOnce(apiKey, promptText)
      const { valid, errors } = validateWebsite(data)
      if (valid) return { ok: true, data }
      lastError = `schema invalid: ${errors.join(', ')}`
    } catch (err) {
      lastError = err?.message || String(err)
    }
  }
  return { ok: false, error: lastError }
}
