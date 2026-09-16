import { test, expect } from '@playwright/test'

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
