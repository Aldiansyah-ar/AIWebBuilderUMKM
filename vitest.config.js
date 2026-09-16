import { defineConfig } from 'vitest/config'

// Separate from vite.config.js on purpose: unit tests target plain server/
// and shared/ JS (Node environment, no React/Tailwind/backendApiPlugin
// needed), while e2e tests (playwright.config.js) drive the real app.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
  },
})
