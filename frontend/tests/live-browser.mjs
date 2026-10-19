// Acceptance against a real running, full-data, same-origin dashboard.
import assert from 'node:assert/strict';
import { chromium as playwrightChromium } from 'playwright-core';
import chromium from '@sparticuz/chromium';
const base = process.env.SENTINEL_TEST_SITE_URL;
if (!base) throw Error('SENTINEL_TEST_SITE_URL is required');
const browser = await playwrightChromium.launch({
  args: chromium.args,
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || await chromium.executablePath(),
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByText('LIVE API SESSION').waitFor();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByText('2 / 174', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await page.getByRole('button', { name: 'Risk intelligence', exact: true }).click();
  await page.getByLabel('Report month', { exact: true }).selectOption('2026-07');
  await page.getByLabel('Filter risk signals by project code').fill('400298');
  await page.getByLabel('Search risk signals by project name').fill('NADIKUDE');
  await page.getByLabel('Reported signal type').selectOption('reported_progress_decrease');
  const card = page.locator('.signal-card');
  await card.getByText('Reported progress decreased', { exact: true }).waitFor();
  const text = await card.textContent();
  assert.match(text, /55\.02/);
  assert.match(text, /53\.02/);
  assert.match(text, /Review required/);
  assert.match(text, /FlashReport_June_2026\.pdf/);
  assert.match(text, /FlashReport_July_2026\.pdf/);
  // Discover real labels from the same revision and use every identity dimension.
  const identity = await page.evaluate(async () => {
    const r = await fetch('/api/v1/projects/400298?report_month=2026-07');
    return (await r.json()).data.identity;
  });
  await page.getByRole('button', { name: 'Filters: 0 selected' }).click();
  for (const [field, label] of [['sector','Sector'],['ministry','Ministry'],['state','State'],['agency','Agency']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.getByLabel(`Search ${field} labels`).fill(identity[field]);
    if (field === 'agency' || field === 'ministry') {
      await page.getByRole('button', { name: 'Add typed', exact: true }).click();
    } else {
      await page.getByRole('checkbox', { name: identity[field], exact: true }).check();
    }
  }
  await page.getByRole('button', { name: 'Close filters' }).click();
  await card.getByText('Reported progress decreased', { exact: true }).waitFor();
  await card.getByRole('button', { name: 'Inspect project history' }).click();
  await page.getByLabel('From month').selectOption('2026-08');
  await page.getByLabel('To month').selectOption('2026-07');
  await page.getByRole('alert').filter({ hasText: 'VALIDATION_ERROR' }).waitFor();
  await page.getByLabel('From month').selectOption('2026-06');
  await page.getByRole('alert').filter({ hasText: 'VALIDATION_ERROR' }).waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Close inspector', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.getByLabel('Report month', { exact: true }).selectOption('2026-04');
  await page.getByText('No adjacent prior report', { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.getByLabel('Report month', { exact: true }).isVisible(), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Mobile viewport must not overflow horizontally');
  assert.deepEqual(errors, []);
  console.log('PASS: real-data browser paging, risk evidence, all identity filters, history recovery, themes and mobile layout');
} finally { await browser.close(); }
