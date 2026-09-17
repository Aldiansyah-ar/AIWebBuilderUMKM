import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §7, TC-02: Color & Tone Revision
//   Langkah: Input revisi: "Ganti nuansa warna jadi cokelat tua klasik"
//   Hasil yang diharapkan: Tema warna berubah; teks dan link nomor
//   WhatsApp tetap utuh. (Wajib Lulus)
// Also US-07 acceptance criteria: "Revisi warna/tema via chat reaktif dan
// instan tanpa merusak konten atau nomor kontak WhatsApp."
//
// Triggered via the "☕ Cokelat Klasik" quick-action button rather than
// typing the phrase into the chat box: GitHub issue #4 found that treating
// free-typed text containing a color word as an instant deterministic
// theme swap could silently misroute a business description (e.g. one
// mentioning "biru") into losing its content, so the deterministic
// shortcut is now scoped to the dedicated quick-action buttons only —
// free-typed revisions go through the real AI revise path instead.

test('TC-02: Color & Tone Revision changes the theme while content and the WA number stay intact', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  const heroHeading = frame.getByRole('heading', { level: 1 })
  await expect(heroHeading).toBeVisible()

  const titleBefore = await heroHeading.textContent()
  const colorBefore = await frame.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor)
  const waLinkBefore = await frame.getByRole('link', { name: /WhatsApp/i }).first().getAttribute('href')

  await page.getByRole('button', { name: /Cokelat Klasik/ }).click()

  // "Tema warna berubah": some rendered color actually changed.
  await expect
    .poll(() => frame.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(colorBefore)

  // "teks ... tetap utuh": hero copy is unchanged by a color-only request.
  await expect(heroHeading).toHaveText(titleBefore)

  // "link nomor WhatsApp tetap utuh".
  const waLinkAfter = await frame.getByRole('link', { name: /WhatsApp/i }).first().getAttribute('href')
  expect(waLinkAfter).toBe(waLinkBefore)
})
