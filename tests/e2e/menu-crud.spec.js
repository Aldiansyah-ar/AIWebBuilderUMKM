import { test, expect } from '@playwright/test'
import { mockGenerateSuccess, previewFrame, WARUNG_KOPI_DRAFT } from './fixtures.js'

// Issue #52 — direct edit/delete on menu items in the live preview.
// WARUNG_KOPI_DRAFT has exactly 3 services, which doubles as coverage for
// the "can't go below 3" guard (shared/schema.js's own services min).

test('#52: editing a menu card updates the preview in place', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  await expect(frame.getByRole('heading', { name: 'Kopi Tubruk' })).toBeVisible()

  await frame.getByRole('button', { name: 'Edit item' }).first().click()
  const nameInput = frame.getByPlaceholder('Nama')
  await nameInput.fill('Kopi Tubruk Spesial')
  await frame.getByPlaceholder('Harga (mis. Rp15.000)').fill('Rp16.000')
  await frame.getByRole('button', { name: 'Simpan' }).click()

  await expect(frame.getByRole('heading', { name: 'Kopi Tubruk Spesial' })).toBeVisible()
  await expect(frame.getByText('Rp16.000')).toBeVisible()
  await expect(frame.getByRole('heading', { name: 'Kopi Tubruk', exact: true })).toHaveCount(0)
})

test('#52: deleting a menu item removes it, but is blocked at the 3-item minimum', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  await expect(frame.getByRole('heading', { name: 'Kopi Tubruk' })).toBeVisible()

  // Exactly 3 items to start — every Delete button should already be disabled.
  const deleteButtons = frame.getByRole('button', { name: 'Hapus item' })
  await expect(deleteButtons).toHaveCount(3)
  for (let i = 0; i < 3; i++) {
    await expect(deleteButtons.nth(i)).toBeDisabled()
  }

  // Add a 4th item via the existing quick action so deletion has room to work.
  await page.getByRole('button', { name: /Menu Baru/ }).click()
  await expect(frame.getByRole('heading', { name: 'Kopi Tubruk' })).toBeVisible()
  await expect(deleteButtons).toHaveCount(4)
  await expect(deleteButtons.first()).toBeEnabled()

  await deleteButtons.first().click()
  await expect(deleteButtons).toHaveCount(3)
  // Back at the minimum — disabled again.
  for (let i = 0; i < 3; i++) {
    await expect(deleteButtons.nth(i)).toBeDisabled()
  }
})
