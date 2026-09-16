import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §7, TC-01: First Draft Generation
//   Langkah: Input teks: "Warung Kopi Sejahtera, jual kopi tubruk dan roti
//   bakar di Surabaya, target anak muda nugas, wa 08123456789"
//   Hasil yang diharapkan: Preview me-render template F&B otomatis, copy
//   bahasa Indonesia santai, 3 menu, tombol WA aktif. (Wajib Lulus)
const TC01_INPUT = 'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'

test('TC-01: First Draft Generation renders the F&B template with 3 menu items and an active WA button', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')

  await page.getByPlaceholder('Minta perubahan pada website...').fill(TC01_INPUT)
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)

  // "3 menu": services list has exactly 3 items (also the schema's own
  // "services minimal 3" rule, §5).
  await expect(frame.locator('#services h3')).toHaveCount(3)

  // "tombol WA aktif": the WhatsApp CTA resolves to a real wa.me link for
  // the number given in the input (08123456789 -> 628123456789).
  const waLink = frame.getByRole('link', { name: /WhatsApp/i }).first()
  await expect(waLink).toHaveAttribute('href', /^https:\/\/wa\.me\/628123456789/)
  await expect(waLink).not.toHaveAttribute('aria-disabled', 'true')

  // "template F&B otomatis": the F&B template pill is the active one (US-06,
  // §3 template board: Template B = F&B).
  await expect(page.getByRole('button', { name: 'F&B' })).toHaveClass(/bg-white/)
})
