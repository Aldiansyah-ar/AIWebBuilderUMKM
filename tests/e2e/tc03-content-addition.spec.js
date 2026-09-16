import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §7, TC-03: Content Addition
//   Langkah: Input revisi: "Tambahkan menu baru: Pisang Goreng Keju harga
//   15 ribu"
//   Hasil yang diharapkan: Daftar menu bertambah 1 item secara reaktif di
//   preview tanpa reload. (Wajib Lulus)
const TC03_INPUT = 'Tambahkan menu baru: Pisang Goreng Keju harga 15 ribu'

test('TC-03: Content Addition grows the menu by 1 item reactively, without a page reload', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  const services = frame.locator('#services h3')
  await expect(services).toHaveCount(3)

  // Prove "tanpa reload": a marker set on `window` only survives if the
  // document is never torn down and recreated by a navigation.
  await page.evaluate(() => { window.__e2eNoReloadMarker = 'still-here' })

  await page.getByPlaceholder('Minta perubahan pada website...').fill(TC03_INPUT)
  await page.getByTitle('Kirim revisi').click()

  // "Daftar menu bertambah 1 item ... secara reaktif".
  await expect(services).toHaveCount(4)
  await expect(frame.locator('#services').getByText(/Pisang Goreng Keju/i)).toBeVisible()

  // "tanpa reload".
  expect(await page.evaluate(() => window.__e2eNoReloadMarker)).toBe('still-here')
})
