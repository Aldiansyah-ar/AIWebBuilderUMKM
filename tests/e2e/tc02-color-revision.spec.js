import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §7, TC-02: Color & Tone Revision
//   Langkah: Input revisi: "Ganti nuansa warna jadi cokelat tua klasik"
//   Hasil yang diharapkan: Tema warna berubah; teks dan link nomor
//   WhatsApp tetap utuh. (Wajib Lulus)
// Also US-07 acceptance criteria: "Revisi warna/tema via chat reaktif dan
// instan tanpa merusak konten atau nomor kontak WhatsApp."
const TC02_INPUT = 'Ganti nuansa warna jadi cokelat tua klasik'

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

  await page.getByPlaceholder('Minta perubahan pada website...').fill(TC02_INPUT)
  await page.getByTitle('Kirim revisi').click()

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
