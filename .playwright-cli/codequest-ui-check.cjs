const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(process.cwd(), '.playwright-cli');
  fs.mkdirSync(outDir, { recursive: true });

  const results = {
    browserAvailability: 'Invocation failed: Browser is not available: iab',
    baseUrl: 'http://localhost:5173',
    screenshots: {},
    console: [],
    socialMessage: null,
    identity: {},
    admin: {},
    mobile: {},
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      results.console.push({ type: msg.type(), text: msg.text() });
    }
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  results.identity.loginUrl = page.url();
  results.identity.loginTitle = await page.title();
  results.identity.loginHasCard = await page.locator('h1:has-text("Login")').isVisible();

  await page.getByRole('button', { name: 'Continuar com Google' }).click();
  results.socialMessage = await page.locator('text=Login com Google ainda não está configurado.').textContent();

  results.screenshots.loginDesktop = path.join(outDir, 'login-desktop.png');
  await page.screenshot({ path: results.screenshots.loginDesktop, fullPage: false });

  await page.getByLabel('Email').fill('admin@codequest.dev');
  await page.getByLabel('Senha').fill('Admin12345!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  results.identity.dashboardUrl = page.url();
  results.identity.dashboardHasContent = await page.locator('text=CodeQuest').first().isVisible();

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  const pendingButton = page.locator('button').filter({ hasText: 'Pergunta pendente visual' }).first();
  results.admin.pendingVisible = await pendingButton.isVisible();
  if (results.admin.pendingVisible) {
    await pendingButton.click();
  }

  const checklist = page.locator('input[type="checkbox"]');
  const count = await checklist.count();
  for (let index = 0; index < count; index += 1) {
    await checklist.nth(index).check();
  }

  await page.getByLabel('Notas de aprovação').fill('Aprovada no fluxo visual automatizado.');
  await page.getByRole('button', { name: 'Aprovar' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  results.admin.emptyStateVisible = await page.locator('text=Nenhuma pergunta pendente').isVisible().catch(() => false);
  results.admin.approvedBadgeVisible = await page.locator('text=Aprovada').first().isVisible().catch(() => false);
  results.screenshots.adminAfterApprove = path.join(outDir, 'admin-after-approve.png');
  await page.screenshot({ path: results.screenshots.adminAfterApprove, fullPage: false });

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  results.mobile.url = mobilePage.url();
  results.mobile.hasLoginTitle = await mobilePage.locator('h1:has-text("Login")').isVisible();
  results.screenshots.loginMobile = path.join(outDir, 'login-mobile.png');
  await mobilePage.screenshot({ path: results.screenshots.loginMobile, fullPage: false });
  await mobileContext.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
