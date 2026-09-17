import { test, expect } from '@playwright/test'
import { mockGenerateFailureWithFallback, previewFrame, RETAIL_FALLBACK_DRAFT } from './fixtures.js'

// Issue #15: /api/generate's llm_failed response carries a `fallback`
// (shared/schema.js FALLBACKS, picked server-side via getFallback) meant to
// be more accurate for the detected category than App.jsx's own
// local/deterministic guess (determineTemplate). doc/AI_FLOW.md §8 used to
// flag this as unused; App.jsx now reads it (see the "Offline/failure
// fallback" branch) but nothing proved it actually works, or that it wins
// when it disagrees with the local guess — every existing test mocked
// `fallback: null`, which never exercises this branch at all.
test('#15: a llm_failed backend fallback is applied, and its templateId wins over local detection', async ({ page }) => {
  await mockGenerateFailureWithFallback(page, RETAIL_FALLBACK_DRAFT)
  await page.goto('/')

  // Plain text with no F&B/retail/service keyword — determineTemplate
  // defaults this to Services (see templateSelector.test.js's own "defaults
  // to Services for ... unrecognized input" case), while the mocked backend
  // fallback above is Retail. A correct implementation must render Retail.
  await page.getByPlaceholder('Minta perubahan pada website...').fill('Sebuah usaha yang unik dan berbeda')
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)

  // The backend fallback's own content ended up on the page — not a
  // locally-detected placeholder business.
  await expect(frame.getByRole('heading', { name: `Tentang ${RETAIL_FALLBACK_DRAFT.meta.businessName}` })).toBeVisible()

  // Its templateId (Retail) won over local detection's Services guess.
  await expect(page.getByRole('button', { name: 'Retail' })).toHaveClass(/bg-white/)
  await expect(page.getByRole('button', { name: 'Services' })).not.toHaveClass(/bg-white/)
})
