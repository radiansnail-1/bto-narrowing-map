import { test, expect } from '@playwright/test';

test('guides a visitor through four questions and opens a project card', async ({ page }) => {
  // Browser automation exercises the deterministic software-renderer path; headed visual QA covers full quality.
  await page.goto('/?lite=1');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-quality', 'lite');
  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where do you spend your weekdays?' })).toBeVisible();

  await page.getByRole('button', { name: /Raffles Place CBD/ }).click();
  await page.getByRole('button', { name: /Tanjong Pagar/ }).click();
  await expect(page.getByRole('button', { name: /one-north/ })).toBeDisabled();
  await expect(page.getByTestId('custom-pin-action')).toHaveText(/replaces hubs/);
  await page.getByTestId('custom-pin-action').click();
  await page.locator('canvas').click({ position: { x: 475, y: 385 } });
  await expect(page.getByTestId('custom-pin-action')).toHaveText('Remove custom workplace pin');
  await expect(page.getByRole('button', { name: /Raffles Place CBD/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: /Tanjong Pagar/ })).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('next-question').click();
  await expect(page.getByRole('heading', { name: 'What kind of home fits your budget?' })).toBeVisible();
  await page.getByLabel('Preferred flat type').selectOption('4-room');
  await page.getByLabel('Maximum price').fill('500000');
  await page.getByTestId('next-question').click();
  await expect(page.getByRole('heading', { name: 'What should be close by?' })).toBeVisible();
  await page.getByRole('button', { name: 'MRT stations', exact: true }).last().click();
  await page.getByRole('button', { name: 'Shopping', exact: true }).last().click();
  await page.getByRole('button', { name: 'Parks', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'Healthcare', exact: true }).last()).toBeDisabled();
  await expect(page.locator('.tag-choice.is-selected')).toHaveCount(3);
  await page.getByTestId('next-question').click();
  await expect(page.getByRole('heading', { name: 'How patient can you be?' })).toBeVisible();
  await page.getByRole('button', { name: /Sooner/ }).click();
  await page.getByTestId('next-question').click();

  const trayToggle = page.getByRole('button', { name: 'Explore sites', exact: true });
  await expect(trayToggle).toHaveAttribute('aria-expanded', 'false');
  await trayToggle.click();
  await expect(trayToggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Tampines Nova', exact: true }).click();
  await expect(page.getByTestId('project-card')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tampines Nova' })).toBeVisible();
  await expect(page.locator('.criteria-row')).toHaveCount(4);
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-boundary-state', 'approximate-1km');
  await page.getByRole('button', { name: 'Back to narrowing' }).click();
  await expect(page.getByTestId('question-card')).toBeVisible();
  await page.getByRole('button', { name: /Bedok — November 2026/ }).click();
  await expect(page.getByTestId('map-context-label')).toHaveText(/location unavailable/);
  await expect(page.getByTestId('project-card')).toContainText('Unavailable');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-boundary-state', 'unavailable');
});

test('malformed stored answers reset to the safe default shape', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('bto-narrowing-map:v1', JSON.stringify({
      answers: { workHubIds: ['not-a-hub'], maxBudget: 'free', flatType: 'penthouse', amenityCategories: ['bus'], waitingBand: 'never', customWorkplace: ['x', 3] },
      visibleAmenities: ['bus'],
      step: 99,
    }));
  });
  await page.goto('/?lite=1');
  await expect(page.getByRole('heading', { name: 'Where do you spend your weekdays?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Raffles Place CBD/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('custom-pin-action')).toHaveText(/Drop custom workplace pin/);
});
