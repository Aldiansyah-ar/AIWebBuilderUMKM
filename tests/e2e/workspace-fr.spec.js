import { test, expect } from '@playwright/test'

// .SKILL.md §2, US-01 (Workspace Dual-Panel Layout) acceptance criteria:
//   "Dual-panel split view (kiri chat ~35%, kanan preview iframe ~65%).
//   Transisi lancar tanpa refresh."
test.describe('FR-01 / US-01: Dual-Panel Workspace', () => {
  test('both the chat panel (left) and the preview panel (right) are present', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Asisten Website' })).toBeVisible()
    await expect(page.locator('iframe[title="Live preview website UMKM"]')).toBeVisible()
  })
})

// .SKILL.md §2, US-02 (Toggle Viewport Mode) acceptance criteria:
//   "Toggle untuk mode Desktop dan Mobile. Tampilan responsif pada resolusi
//   layar minimal." Also NFR-02: responsif 375px (smartphone) - 1440px (desktop).
test.describe('FR-01 / US-02: Toggle Viewport Mode', () => {
  test('a Desktop/Mobile toggle switches the preview between the two modes', async ({ page }) => {
    await page.goto('/')

    const desktopBtn = page.getByRole('button', { name: 'Desktop' })
    const mobileBtn = page.getByRole('button', { name: 'Mobile' })
    await expect(desktopBtn).toBeVisible()
    await expect(mobileBtn).toBeVisible()

    const preview = page.locator('iframe[title="Live preview website UMKM"]')
    const desktopWidth = (await preview.boundingBox()).width

    await mobileBtn.click()

    // "Tampilan responsif": switching to Mobile visibly narrows the preview
    // (poll instead of a single read — the layout needs a tick to re-render
    // after the class switch).
    await expect
      .poll(async () => (await preview.boundingBox()).width)
      .toBeLessThan(desktopWidth)
  })

  test('workspace stays usable at NFR-02\'s minimum smartphone width (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Asisten Website' })).toBeVisible()
    await expect(page.getByPlaceholder('Minta perubahan pada website...')).toBeVisible()
  })

  test('workspace stays usable at NFR-02\'s desktop width (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Asisten Website' })).toBeVisible()
    await expect(page.locator('iframe[title="Live preview website UMKM"]')).toBeVisible()
  })
})
