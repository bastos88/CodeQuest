const { test, expect } = require('playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), '.playwright-cli');
fs.mkdirSync(outDir, { recursive: true });
const qa = {
  browserAvailability: 'Invocation failed: Browser is not available: iab',
  baseUrl: 'http://localhost:5173',
  screenshots: {},
  console: [],
  socialMessage: null,
  identity: {},
  admin: {},
  mobile: {},
};

test('login and admin moderation flow', async ({ page, browser }) => {
  test.setTimeout(60000);
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      qa.console.push({ type: msg.type(), text: msg.text() });
    }
  });

  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  qa.identity.loginUrl = page.url();
  qa.identity.loginTitle = await page.title();
  qa.identity.loginHasCard = await page.locator('h1').filter({ hasText: 'Login' }).isVisible();
  await expect(page.locator('h1').filter({ hasText: 'Login' })).toBeVisible();

  await page.getByRole('button', { name: 'Continuar com Google' }).click();
  const socialNotice = page.locator('text=/Google.*configurado/i').first();
  await expect(socialNotice).toBeVisible();
  qa.socialMessage = await socialNotice.textContent();

  qa.screenshots.loginDesktop = path.join(outDir, 'login-desktop.png');
  await page.screenshot({ path: qa.screenshots.loginDesktop, fullPage: false });

  await page.getByLabel('Email').fill('admin@codequest.dev');
  await page.getByLabel('Senha').fill('Admin12345!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/dashboard');
  qa.identity.dashboardUrl = page.url();
  qa.identity.dashboardHasContent = await page.locator('text=CodeQuest').first().isVisible();

  await page.locator('aside').getByRole('link', { name: 'Admin', exact: true }).click();
  await page.waitForURL('**/admin');
  await page.waitForLoadState('networkidle');

  const pendingButton = page.locator('button').filter({ hasText: 'Pergunta pendente visual' }).first();
  qa.admin.pendingVisible = await pendingButton.isVisible();
  await expect(pendingButton).toBeVisible();
  await pendingButton.click();

  const checklist = page.locator('input[type="checkbox"]');
  const count = await checklist.count();
  for (let index = 0; index < count; index += 1) {
    await checklist.nth(index).check();
  }

  await page.locator('textarea').nth(0).fill('Aprovada no fluxo visual automatizado.');
  await page.getByRole('button', { name: 'Aprovar' }).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  qa.admin.emptyStateVisible = await page.locator('text=Nenhuma pergunta pendente').isVisible().catch(() => false);
  qa.admin.approvedBadgeVisible = await page.locator('text=Aprovada').first().isVisible().catch(() => false);
  qa.screenshots.adminAfterApprove = path.join(outDir, 'admin-after-approve.png');
  await page.screenshot({ path: qa.screenshots.adminAfterApprove, fullPage: false });

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/login');
  await mobilePage.waitForLoadState('networkidle');
  qa.mobile.url = mobilePage.url();
  qa.mobile.hasLoginTitle = await mobilePage.locator('h1').filter({ hasText: 'Login' }).isVisible();
  qa.screenshots.loginMobile = path.join(outDir, 'login-mobile.png');
  await mobilePage.screenshot({ path: qa.screenshots.loginMobile, fullPage: false });
  await mobileContext.close();

  console.log('QA_RESULT ' + JSON.stringify(qa));
});




