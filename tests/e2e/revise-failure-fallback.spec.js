import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, mockReviseFailure, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// A live production bug: when a free-text revision failed (rate limit,
// Gemini quota, network blip — /api/revise never returns a fallback the
// way /api/generate does), the old fallback dumped the raw user message
// straight into meta.tagline as a fake "something changed" signal. On a
// real site this looked like broken/garbled content the moment any
// revision genuinely failed, while the chat still claimed success.
test('#revise-failure-fallback: a failed free-text revision leaves content untouched and says so honestly', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  await expect(frame.locator('#services h3').first()).toBeVisible({ timeout: 10000 })

  await mockReviseFailure(page)
  await page.getByPlaceholder('Minta perubahan pada website...').fill('warna merah romantis')
  await page.getByTitle('Kirim revisi').click()

  // Honest failure message in chat — not a false "berhasil diterapkan".
  await expect(page.locator('aside').getByText(/belum bisa diproses AI saat ini/i)).toBeVisible()

  // The raw message never lands in the tagline (or anywhere else visible).
  await expect(frame.getByText('warna merah romantis', { exact: false })).toHaveCount(0)
  await expect(frame.getByText(WARUNG_KOPI_DRAFT.meta.tagline).first()).toBeVisible()
})
