import { test, expect } from '@playwright/test'
import JSZip from 'jszip'
import { promises as fs } from 'node:fs'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §7, TC-04: Export HTML Test
//   Langkah: Klik "Download Website", buka file .html di browser lokal
//   Hasil yang diharapkan: Tampilan identik dengan preview, tata letak
//   responsif, link WA mengarah ke https://wa.me/628123456789... (Wajib Lulus)
// §4.2 FR-06: "Bundle ZIP / single HTML mandiri, Tailwind CDN/inline,
// direct WhatsApp link generator (https://wa.me/{nomor}?text={pesan})."
test('TC-04: downloaded export is a standalone bundle with a working wa.me link', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()
  await expect(previewFrame(page).locator('#services h3').first()).toBeVisible({ timeout: 10000 })

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download Website' }).click(),
  ])

  const path = await download.path()
  const buffer = await fs.readFile(path)

  // FR-06 accepts either a ZIP bundle or a single standalone HTML.
  const isZip = download.suggestedFilename().endsWith('.zip')
  const html = isZip
    ? await (await JSZip.loadAsync(buffer)).file(/\.html$/i)[0].async('string')
    : buffer.toString('utf-8')

  // "Tampilan identik dengan preview": same business content present.
  expect(html).toContain(WARUNG_KOPI_DRAFT.meta.businessName)

  // "link WA mengarah ke https://wa.me/628123456789...".
  expect(html).toContain('https://wa.me/628123456789')

  // "standalone" (FR-06): usable offline, no dependency on the dev server.
  expect(html).not.toMatch(/localhost:\d+/)
})
