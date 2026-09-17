import { test, expect } from '@playwright/test'
import { WARUNG_KOPI_DRAFT } from './fixtures.js'

// .SKILL.md §4.2, FR-02 (Conversational Onboarding):
//   "Pesan pembuka otomatis, validasi no empty input, tombol Quick Fill /
//   Contoh Prompt (Bakso, Barbershop, dll)."
test.describe('FR-02: Conversational Onboarding', () => {
  test('shows an automatic opening message on first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Asisten Website' })).toBeVisible()
    // "Pesan pembuka otomatis": an assistant greeting is present without the
    // user having sent anything yet (input is still empty at this point).
    await expect(page.getByPlaceholder('Minta perubahan pada website...')).toHaveValue('')
    await expect(page.locator('aside').getByText(/^Halo/)).toBeVisible()
  })

  test('validates against empty input (send is blocked until something is typed)', async ({ page }) => {
    await page.goto('/')

    const sendButton = page.getByTitle('Kirim revisi')
    await expect(sendButton).toBeDisabled()

    await page.getByPlaceholder('Minta perubahan pada website...').fill('   ')
    await expect(sendButton).toBeDisabled()

    await page.getByPlaceholder('Minta perubahan pada website...').fill('Warung Bakso Pak Slamet')
    await expect(sendButton).toBeEnabled()
  })

  test('offers quick-fill example prompts (Bakso, Barbershop, dll)', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: /Bakso/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Barbershop/ })).toBeVisible()
  })
})

// GitHub issue #16: e2e coverage for the 4-phase step-indicator sequence
// (issue #12 wired `msg.steps` — "Memahami info bisnis" -> "Memilih template"
// -> "AI menyusun konten" -> "Preview siap"). Delays the mocked /api/generate
// response so each phase's transient in-progress state is actually
// observable instead of the test only ever seeing the final "all done" state.
test.describe('FR-02: step-indicator 4-fase onboarding', () => {
  test('phases progress pending -> in-progress -> done in order, not prematurely marked done', async ({ page }) => {
    await page.route('**/api/generate', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: WARUNG_KOPI_DRAFT, source: 'llm' }),
      })
    })
    await page.goto('/')

    await page.getByPlaceholder('Minta perubahan pada website...').fill(
      'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
    )
    await page.getByTitle('Kirim revisi').click()

    const chat = page.locator('aside')
    const step1 = chat.getByText('Memahami info bisnis')
    const step2 = chat.getByText('Memilih template')
    const step3 = chat.getByText('AI menyusun konten')
    const step4 = chat.getByText('Preview siap')

    // Phase 1 starts in-progress immediately.
    await expect(step1).toHaveClass(/text-blue-600/)

    // While the (artificially delayed) network call is still in flight,
    // phase 3 must be the one showing in-progress — and the last phase
    // must still be pending, not jumped to "done" ahead of time.
    await expect(step3).toHaveClass(/text-blue-600/)
    await expect(step4).toHaveClass(/text-slate-400/)

    // Once the response lands, every phase ends up done.
    await expect(step1).toHaveClass(/text-slate-800/)
    await expect(step2).toHaveClass(/text-slate-800/)
    await expect(step3).toHaveClass(/text-slate-800/)
    await expect(step4).toHaveClass(/text-slate-800/)
  })
})
