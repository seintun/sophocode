import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});

test('healthcheck returns 200', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();
});
