import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home page loads with hero and nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vencore/);
    await expect(page.locator('#s0')).toBeVisible();
    await expect(page.locator('#s0 .btn-solid--hero')).toBeVisible();
  });

  test('projects index lists case studies', async ({ page }) => {
    await page.goto('/projects/');
    await expect(page).toHaveTitle(/Projects/);
    await expect(page.getByText(/Raghava Iris/i).first()).toBeVisible();
    await expect(page.getByText(/Coming soon/i).first()).toBeVisible();
  });

  test('contact page shows enquiry form', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('#brief-form-el')).toBeVisible();
    await expect(page.getByLabel(/Name/i)).toBeVisible();
  });

  test('insights article renders', async ({ page }) => {
    await page.goto('/insights/office-design-trends/');
    await expect(page).toHaveTitle(/Office Design Trends/);
    await expect(page.locator('.ins-article')).toBeVisible();
  });

  test('service page loads', async ({ page }) => {
    await page.goto('/services/residential/');
    await expect(page).toHaveTitle(/Residential Interiors/);
  });
});
