/**
 * routes.js — TSK-01B/02B (Dev 1B): HTTP layer for the backend API.
 * Body parsing + JSON responses; the actual LLM orchestration lives in
 * geminiClient.js, the prompt text in prompts.js, and the shared contract
 * (validateWebsite/getFallback) in ../shared/schema.js.
 */
import { buildInitialPrompt, buildRevisionPrompt } from './prompts.js'
import { getFallback } from '../shared/schema.js'
import { generateWithRetry } from './geminiClient.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch { reject(new Error('invalid_json_body')) }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/** Registers POST /api/generate and /api/revise on a Vite dev/preview server. */
export function registerApiRoutes(server, apiKey) {
  server.middlewares.use(async (req, res, next) => {
    if (req.method !== 'POST' || (req.url !== '/api/generate' && req.url !== '/api/revise')) {
      return next()
    }

    if (!apiKey) {
      return sendJson(res, 200, { ok: false, error: 'not_configured' })
    }

    let body
    try {
      body = await readJsonBody(req)
    } catch {
      return sendJson(res, 400, { ok: false, error: 'bad_request' })
    }

    if (req.url === '/api/generate') {
      const input = String(body?.input || '').trim()
      if (!input) return sendJson(res, 400, { ok: false, error: 'bad_request' })
      const result = await generateWithRetry(apiKey, buildInitialPrompt(input))
      if (result.ok) return sendJson(res, 200, { ok: true, data: result.data, source: 'llm' })
      return sendJson(res, 200, { ok: false, error: 'llm_failed', fallback: getFallback(input) })
    }

    // /api/revise
    const current = body?.current
    const message = String(body?.message || '').trim()
    if (!current || !message) return sendJson(res, 400, { ok: false, error: 'bad_request' })
    const result = await generateWithRetry(apiKey, buildRevisionPrompt(current, message))
    if (result.ok) return sendJson(res, 200, { ok: true, data: result.data, source: 'llm' })
    return sendJson(res, 200, { ok: false, error: 'llm_failed' })
  })
}
