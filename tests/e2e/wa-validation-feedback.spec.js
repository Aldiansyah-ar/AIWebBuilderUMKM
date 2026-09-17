import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, WARUNG_KOPI_DRAFT } from './fixtures.js'

// Issue #26: previously the only signal that a WA number was invalid was
// the preview quietly rendering a disabled button — the user had to notice
// that on their own. Generating a first draft should flag it immediately
// in the chat instead.
test('#26: an invalid WA number in a freshly generated draft is flagged in chat, not just silently disabled in the preview', async ({ page }) => {
  const draftWithBadNumber = { ...WARUNG_KOPI_DRAFT, contact: { ...WARUNG_KOPI_DRAFT.contact, whatsappNumber: '123' } }
  await mockGenerateSuccess(page, draftWithBadNumber)
  await page.goto('/')

  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas'
  )
  await page.getByTitle('Kirim revisi').click()

  await expect(page.locator('aside').getByText(/nomor WhatsApp.*belum lengkap\/valid/i)).toBeVisible()
})

test('#26: a valid WA number in a freshly generated draft does not trigger the warning', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')

  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  await expect(page.locator('aside').getByText('Draft website baru berhasil dibuat')).toBeVisible()
  await expect(page.locator('aside').getByText(/nomor WhatsApp.*belum lengkap\/valid/i)).toHaveCount(0)
})
