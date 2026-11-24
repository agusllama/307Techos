import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Asegurar que exista la carpeta de capturas
const screenshotsDir = path.resolve('test-results', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const PAGES_TO_TEST = [
  { name: 'home', path: '/' },
  { name: 'zona-capital-federal', path: '/capital-federal/' },
  { name: 'zona-partido-de-la-costa', path: '/partido-de-la-costa/' },
  { name: 'zona-san-bernardo', path: '/san-bernardo/' },
  { name: 'zona-mar-de-ajo', path: '/mar-de-ajo/' },
  { name: 'zona-pinamar', path: '/pinamar/' },
  { name: 'zona-villa-gesell', path: '/villa-gesell/' },
  { name: 'zona-mar-del-plata', path: '/mar-del-plata/' },
  { name: 'zona-interior-buenos-aires', path: '/interior-buenos-aires/' },
  { name: 'blog-index', path: '/blog/' },
  { name: 'blog-post', path: '/blog/por-que-se-cae-techo-peugeot-307/' },
];

test.describe('Mobile Viewport (375px) — Validaciones y Reglas de Negocio', () => {

  for (const pageInfo of PAGES_TO_TEST) {
    test(`Página ${pageInfo.name} cumple reglas mobile (sin scroll horizontal, 1 h1, captura)`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });

      // 1. Regla SEO/Estructura: Exactamente un solo <h1>
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `La página ${pageInfo.path} debe tener exactamente un <h1>`).toBe(1);

      // 2. Regla Mobile: Cero desborde horizontal (scrollWidth <= 375px)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth ||
               document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `La página ${pageInfo.path} no debe tener scroll horizontal a 375px`).toBe(false);

      // 3. Captura de pantalla full-page para auditoría visual
      const screenshotPath = path.join(screenshotsDir, `${pageInfo.name}-full-375.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }

  test('Barra flotante de WhatsApp se activa con el scroll y tiene enlace válido', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const stickyBar = page.locator('#mobile-sticky-bar');
    await expect(stickyBar).toBeAttached();

    // En la parte superior (scrollY = 0), la barra flotante está oculta
    const isHiddenInitially = await stickyBar.evaluate(el => el.classList.contains('opacity-0') || el.classList.contains('translate-y-24'));
    expect(isHiddenInitially, 'La barra flotante debe iniciar oculta en el top de la página').toBe(true);

    // Hacemos scroll hacia abajo
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400); // Pequeña espera para la transición CSS

    // Debe hacerse visible
    const isVisibleAfterScroll = await stickyBar.evaluate(el => el.classList.contains('opacity-100') || el.classList.contains('translate-y-0'));
    expect(isVisibleAfterScroll, 'La barra flotante debe aparecer tras scrollear más de 80px').toBe(true);

    // Validar enlace de WhatsApp
    const waLink = stickyBar.locator('a');
    const href = await waLink.getAttribute('href');
    expect(href, 'El botón flotante debe tener un enlace https://wa.me/').toContain('https://wa.me/');
  });

});
