// e2e/DMNViewer.e2e.js
const { test, expect } = require('@playwright/test');

test('loads the DMN viewer', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust the URL to match your development server
  await expect(page.locator('.dmn-container')).toBeVisible();
});

test('creates a new diagram', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('.create-diagram-btn');
  await expect(page.locator('.dmn-diagram')).toBeVisible();
});

test('saves a diagram', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('.create-diagram-btn');
  await page.click('.save-diagram-btn');
  // You can add more assertions here to verify the save functionality
});
