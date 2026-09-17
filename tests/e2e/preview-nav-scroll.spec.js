import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, WARUNG_KOPI_DRAFT } from './fixtures.js'

// The live preview renders inside a sandboxed srcDoc iframe
// (SandboxPreview.jsx). A plain `<a href="#services">` click there
// reliably wiped the iframe back to its pristine empty template instead of
// scrolling — a browser quirk with fragment navigation in sandboxed srcdoc
// frames — losing the whole rendered preview until a full page reload.
// Fixed by intercepting the click and scrolling manually
// (src/lib/scrollToSection.js) instead of letting the browser navigate.
test('preview navbar links scroll to the target section instead of wiping the preview', async ({ page }) => {
  // The navbar's text links are `hidden md:flex` (desktop-only — mobile
  // relies on the sticky WA CTA instead), so this needs a desktop-sized
  // viewport regardless of the project's own device.
  await page.setViewportSize({ width: 1280, height: 800 })
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, target anak muda nugas, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = page.frameLocator('iframe[title="Live preview website UMKM"]')
  await expect(frame.locator('#services h3').first()).toBeVisible({ timeout: 10000 })

  const frameEl = page.locator('iframe[title="Live preview website UMKM"]')
  const getScrollTop = () =>
    frameEl.evaluate((el) => el.contentDocument.documentElement.scrollTop || el.contentDocument.body.scrollTop)
  const getBodyLength = () => frame.locator('body').evaluate((el) => el.innerHTML.length)

  const bodyLengthBefore = await getBodyLength()

  await frame.getByRole('link', { name: 'Kontak' }).click()
  await expect.poll(getScrollTop).toBeGreaterThan(100)

  // The preview must still be the full rendered site, not reset to the
  // sandbox iframe's empty srcdoc template.
  expect(await getBodyLength()).toBeGreaterThan(bodyLengthBefore * 0.9)
  await expect(frame.locator('#contact')).toHaveCount(1)
  await expect(frame.locator('#services')).toHaveCount(1)

  await frame.getByRole('link', { name: 'Beranda' }).click()
  await expect.poll(getScrollTop).toBeLessThan(200)
  expect(await getBodyLength()).toBeGreaterThan(bodyLengthBefore * 0.9)
})
