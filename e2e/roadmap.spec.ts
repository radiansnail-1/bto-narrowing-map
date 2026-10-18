import { test, expect } from '@playwright/test';

test('roadmap balances its dated plan and validates lender and date assumptions', async ({ page }) => {
  await page.goto('/tools/bto-roadmap');
  await expect(page.getByRole('heading', { name: 'BTO funding roadmap', exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://wheretobto.com/tools/bto-roadmap');
  await expect(page.getByRole('heading', { name: 'First loan repayment', exact: true })).toBeVisible();
  await page.getByText('Yearly loan data table', { exact: true }).click();
  await expect(page.getByRole('rowheader', { name: 'Year 25', exact: true })).toBeVisible();
  await page.locator('#roadmap-price').fill('');
  await expect(page.locator('#roadmap-price')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Check highlighted assumptions to see the timeline.')).toBeVisible();
  await page.locator('#roadmap-price').fill('500000');
  await page.getByLabel('Lender assumption').selectOption('bank55');
  await expect(page.locator('#roadmap-loan')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#roadmap-loan').fill('275000');
  await expect(page.getByText(/signing payment is modelled as cash only/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'First loan repayment', exact: true })).toBeVisible();
  await page.locator('#roadmap-keysMonth').fill('2026-10');
  await expect(page.locator('#roadmap-keysMonth')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Check highlighted assumptions to see the timeline.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear / reset example' }).click();
  await expect(page.getByRole('heading', { name: 'First loan repayment', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore a DIA loan-ceiling illustration' })).toHaveAttribute('href', '/tools/dia-calculator');
});

test('phone roadmap saves only with opt-in and restores or removes valid local scenarios', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/bto-roadmap');
  for (const width of [320, 390, 844, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Save scenario', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('bto-roadmap-v1'))).toBeNull();
  await page.locator('#person-0-monthlyCash').fill('1200');
  await page.getByLabel('Allow saving these assumptions on this device').check();
  await page.getByRole('button', { name: 'Save scenario', exact: true }).click();
  await expect(page.getByText('Saved on this browser.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.locator('#person-0-monthlyCash')).toHaveValue('1000');
  await page.getByRole('button', { name: 'Load saved scenario', exact: true }).click();
  await expect(page.locator('#person-0-monthlyCash')).toHaveValue('1200');
  await page.getByLabel('Allow saving these assumptions on this device').uncheck();
  expect(await page.evaluate(() => localStorage.getItem('bto-roadmap-v1'))).toBeNull();
  await page.evaluate(() => localStorage.setItem('bto-roadmap-v1', '{"version":1,"values":{"people":[null,null]}}'));
  await page.getByRole('button', { name: 'Load saved scenario', exact: true }).click();
  await expect(page.getByText('Could not load a valid saved scenario.', { exact: false })).toBeVisible();
  await expect(page.locator('#person-0-monthlyCash')).toHaveValue('1200');
  await page.getByRole('button', { name: 'Clear / reset example' }).click();
  expect(await page.evaluate(() => localStorage.getItem('bto-roadmap-v1'))).toBeNull();
  await page.getByText('Monthly runway data table', { exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'CPF payment', exact: true })).toBeVisible();
});
