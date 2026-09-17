/**
 * security.js — Dev 1B: shared Origin allowlist for /api/generate and
 * /api/revise (issue #20). Both entry points call into this — the Vite
 * dev/preview middleware (routes.js) and the Vercel Serverless Functions
 * (api/generate.js, api/revise.js) — so the policy can't drift between them.
 */
let warned = false

function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

/**
 * A request with no Origin header (same-origin navigation, curl,
 * server-to-server calls) is always allowed — CORS only constrains
 * browsers, and volumetric abuse from any source is rate limiting's job
 * (#8), not this check's. This only blocks what the issue targets: a page
 * on another origin driving a "simple" (no-preflight, e.g.
 * `Content-Type: text/plain`) cross-origin request against these
 * Gemini-backed endpoints to burn quota.
 */
export function isOriginAllowed(origin) {
  const allowed = getAllowedOrigins()
  if (allowed.length === 0) {
    if (!warned) {
      warned = true
      console.warn('[server] ALLOWED_ORIGIN not set — /api/generate and /api/revise accept requests from any Origin. Set ALLOWED_ORIGIN (comma-separated) before going live.')
    }
    return true
  }
  return !origin || allowed.includes(origin)
}
