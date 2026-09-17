import { test, expect } from '@playwright/test'
import {
  mockGenerateSuccess,
  mockGenerateFailureWithFallback,
  mockReviseFailure,
  previewFrame,
  WARUNG_KOPI_DRAFT,
  RETAIL_FALLBACK_DRAFT,
} from './fixtures.js'

// Issues #45-#49 — UX audit hardening (state clarity, offline toast,
// change summary, Undo, save-state indicator). .SKILL.md doesn't have a
// backlog item number for these; they come from the standalone UX audit
// doc reviewed on Demo Day eve.

test('#49: save-state badge reflects "no draft yet" before generation and "Tersimpan" after', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')

  const assistantHeader = page.getByRole('heading', { name: 'Asisten Website' }).locator('..')
  await expect(assistantHeader.getByText('Belum ada draft')).toBeVisible()

  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  await expect(previewFrame(page).getByRole('heading', { level: 1 })).toBeVisible()
  await expect(assistantHeader.getByText('Tersimpan')).toBeVisible()
})

test('#47/#48: a quick-action change shows a change summary and Undo reverts it', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()

  const frame = previewFrame(page)
  const heroHeading = frame.getByRole('heading', { level: 1 })
  await expect(heroHeading).toBeVisible()
  const colorBefore = await frame.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor)

  await page.getByRole('button', { name: /Cokelat Klasik/ }).click()

  const chat = page.locator('aside')
  await expect(chat.getByText('1 perubahan diterapkan:')).toBeVisible()
  await expect(chat.getByText('Tema warna')).toBeVisible()

  await expect
    .poll(() => frame.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(colorBefore)

  const undoButton = chat.getByRole('button', { name: 'Undo' })
  await expect(undoButton).toBeVisible()
  await undoButton.click()

  await expect(chat.getByText('Perubahan terakhir dibatalkan')).toBeVisible()
  await expect
    .poll(() => frame.locator('header').first().evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe(colorBefore)
  // Undo is single-slot for MVP — it disappears once used, even though
  // technically calling it again could keep walking back through history.
  await expect(chat.getByRole('button', { name: 'Undo' })).toHaveCount(0)
})

test('#45/#46: a generate failure with backend fallback renders as "offline", not a green success', async ({ page }) => {
  await mockGenerateFailureWithFallback(page, RETAIL_FALLBACK_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill('Toko Sembako Makmur di Malang, wa 08123456789')
  await page.getByTitle('Kirim revisi').click()

  const chat = page.locator('aside')
  await expect(chat.getByText('Mode offline — pakai fallback backend')).toBeVisible()

  // The toast is a warning (amber), never the green success styling —
  // issue #46's "success-looking error".
  const toast = page.getByRole('status').filter({ hasText: 'AI tidak merespons' })
  await expect(toast).toBeVisible()
  await expect(toast).not.toHaveClass(/bg-emerald-600/)
})

test('#45: a revision failure with no fallback renders as an explicit error state, not a false success', async ({ page }) => {
  await mockGenerateSuccess(page, WARUNG_KOPI_DRAFT)
  await page.goto('/')
  await page.getByPlaceholder('Minta perubahan pada website...').fill(
    'Warung Kopi Sejahtera, jual kopi tubruk dan roti bakar di Surabaya, wa 08123456789'
  )
  await page.getByTitle('Kirim revisi').click()
  await expect(previewFrame(page).getByRole('heading', { level: 1 })).toBeVisible()

  await mockReviseFailure(page)
  await page.getByPlaceholder('Minta perubahan pada website...').fill('warna merah romantis')
  await page.getByTitle('Kirim revisi').click()

  const chat = page.locator('aside')
  await expect(chat.getByText('Belum bisa diproses', { exact: true })).toBeVisible()
  // No change summary or Undo for a flow that applied nothing.
  await expect(chat.getByRole('button', { name: 'Undo' })).toHaveCount(0)
})
