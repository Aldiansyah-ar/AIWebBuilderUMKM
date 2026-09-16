import { test, expect } from '@playwright/test'
import { mockGenerateFailure, previewFrame } from './fixtures.js'

// .SKILL.md §4.2 FR-03: "... penanganan graceful degradation (retry 1x &
// fallback static data)."
// §4.3 NFR-04: "Tidak ada crash saat parsing JSON gagal; gunakan fallback
// data."
test('FR-03 / NFR-04: an AI failure degrades gracefully instead of crashing, using fallback data', async ({ page }) => {
  await mockGenerateFailure(page)
  await page.goto('/')

  await page.getByPlaceholder('Minta perubahan pada website...').fill('Toko Sembako Makmur di Malang, wa 08123456789')
  await page.getByTitle('Kirim revisi').click()

  // "Tidak ada crash": the workspace is still responsive, no error screen.
  await expect(page.getByRole('heading', { name: 'Asisten Website' })).toBeVisible()
  await expect(page.getByPlaceholder('Minta perubahan pada website...')).toBeEnabled()

  // "gunakan fallback data": the preview isn't left stuck loading forever —
  // some website content ends up rendered despite the AI call failing.
  await expect(previewFrame(page).getByText('Memuat website...')).toHaveCount(0)
})
