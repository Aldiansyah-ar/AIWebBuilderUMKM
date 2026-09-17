import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, mockReviseSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// GitHub issue #6: TC-02 and TC-03's revision text happened to match the
// deterministic quick-action keywords (`isDeterministicAction`), so those
// two "Wajib Lulus" acceptance tests never actually exercised POST
// /api/revise — false confidence that the real AI revise path works.
//
// This test uses free-typed text that matches no deterministic keyword and
// no category keyword (so it doesn't trip the #14 category-switch
// confirmation either), mocks /api/revise directly, and asserts both that
// the request actually reached that route with the real message AND that
// the mocked response was applied to the preview.
const FREE_TEXT_REVISION =
  'Sekarang kami buka nonstop 24 jam khusus musim ujian dan sediakan colokan listrik gratis untuk pelanggan yang ingin belajar malam-malam.'

test('a free-typed revision with no deterministic keyword match goes through the real /api/revise path', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  await expect(frame.getByRole('heading', { level: 1 })).toBeVisible()

  let reviseRequestBody = null
  await mockReviseSuccess(
    page,
    { hero: { ...WARUNG_KOPI_DRAFT.hero, subtitle: 'Buka 24 jam khusus musim ujian, colokan listrik gratis!' } },
    (body) => { reviseRequestBody = body }
  )

  await page.getByPlaceholder('Minta perubahan pada website...').fill(FREE_TEXT_REVISION)
  await page.getByTitle('Kirim revisi').click()

  // Proves the request actually reached /api/revise with the real message
  // (not silently handled by a local/deterministic shortcut).
  await expect.poll(() => reviseRequestBody?.message).toBe(FREE_TEXT_REVISION)

  // Proves the mocked LLM response was actually applied to the preview.
  await expect(frame.getByText(/buka 24 jam khusus musim ujian/i)).toBeVisible()
})
