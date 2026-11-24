import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración optimizada de Playwright para 307 Techos:
 * - Usa Google Chrome instalado en el sistema (channel: 'chrome').
 * - Viewport mobile estricto a 375x812 (regla de diseño de AGENTS.md).
 * - Servidor preview automático con Astro.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    channel: 'chrome',
  },

  projects: [
    {
      name: 'mobile-chrome-375',
      use: {
        channel: 'chrome',
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'npx astro preview --port 4321',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
