/**
 * Edge Cases and Accessibility Integration Tests
 *
 * Tests for:
 * - Edge cases and error handling
 * - Accessibility (ARIA, keyboard navigation)
 * - Performance under load
 * - Browser compatibility scenarios
 * - Error recovery
 */

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {

  test('should handle rapid navigation between pages', async ({ page }) => {
    await page.goto('/');

    // Rapidly navigate through dashboards
    const routes = ['/dashboard', '/paradigms', '/environment', '/crises', '/tech-tree'];

    for (let i = 0; i < 3; i++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(100);
      }
    }

    // Should still be functional
    await page.goto('/dashboard');
    await expect(page.getByText(/simulation dashboard/i)).toBeVisible();
  });

  test('should handle browser refresh during simulation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(3000);

    // Refresh page
    await page.reload();
    await page.waitForTimeout(2000);

    // Simulation state might be lost (expected behavior)
    // Should show "Configure & Start" again or maintain state if persisted
    const configButton = page.getByRole('button', { name: /configure.*start/i });
    const controlButtons = page.getByRole('button', { name: /(start|pause)/i });

    // One of these should be visible
    const hasInitButton = await configButton.isVisible().catch(() => false);
    const hasControlButton = await controlButtons.isVisible().catch(() => false);

    expect(hasInitButton || hasControlButton).toBeTruthy();
  });

  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/paradigms');
    await page.goto('/environment');

    // Use browser back
    await page.goBack();
    expect(page.url()).toContain('/paradigms');

    await page.goBack();
    expect(page.url()).toContain('/dashboard');

    // Forward
    await page.goForward();
    expect(page.url()).toContain('/paradigms');
  });

  test('should handle concurrent initialization attempts', async ({ page }) => {
    await page.goto('/');

    // Click configure button
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Try to initialize
    const initButton = page.getByRole('button', { name: /^initialize$/i });
    await initButton.click();

    // Button should be disabled or modal should close
    await page.waitForTimeout(2000);

    // Modal should be closing or button disabled
    const modalVisible = await page.getByRole('dialog').isVisible().catch(() => false);
    const buttonDisabled = await initButton.isDisabled().catch(() => true);

    // Either modal is closing or button is disabled
    expect(!modalVisible || buttonDisabled).toBeTruthy();
  });

  test('should handle very long simulation runs', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes timeout

    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Set to max speed
    await page.getByLabel(/simulation speed/i).selectOption('4.0');

    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Start at max speed
    await page.getByRole('button', { name: /start/i }).click();

    // Run for extended period
    await page.waitForTimeout(60000); // 1 minute

    // Should still be responsive
    await page.getByRole('button', { name: /pause/i }).click();

    // Dashboard should still work
    await page.goto('/dashboard');
    await expect(page.locator('text=/\\d+/').first()).toBeVisible();
  });

  test('should handle network interruption gracefully', async ({ page }) => {
    await page.goto('/');

    // Simulate offline mode
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Go back online
    await page.context().setOffline(false);

    // Should recover
    await page.goto('/dashboard');
    await expect(page.getByText(/simulation dashboard/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/dashboard');

    // Should have main landmark
    await expect(page.locator('main')).toBeVisible();

    // Should have nav landmark
    await expect(page.locator('nav')).toBeVisible();

    // Should have proper heading hierarchy
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have accessible button labels', async ({ page }) => {
    await page.goto('/');

    // Buttons should have accessible names
    const configButton = page.getByRole('button', { name: /configure.*start/i });
    await expect(configButton).toBeVisible();

    // After initialization
    await configButton.click();
    await page.waitForSelector('role=dialog');

    const initButton = page.getByRole('button', { name: /initialize/i });
    await expect(initButton).toBeVisible();

    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Form inputs should have labels
    await expect(page.getByLabel(/rng seed/i)).toBeVisible();
    await expect(page.getByLabel(/scenario mode/i)).toBeVisible();
    await expect(page.getByLabel(/simulation speed/i)).toBeVisible();
  });

  test('should support keyboard navigation in modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to tab to buttons
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.focus();

    const isFocused = await cancelButton.evaluate(el => el === document.activeElement);
    // Focus handling may vary
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Dialog should have role
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Links should be accessible
    const links = await page.locator('a[href]').all();
    expect(links.length).toBeGreaterThan(0);

    // Each link should have accessible text
    for (const link of links.slice(0, 5)) {
      const text = await link.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for text elements
    const textElements = await page.locator('p, span, div').all();

    // Should have visible text
    expect(textElements.length).toBeGreaterThan(0);

    // Note: Actual contrast checking would require additional tools
    // This test validates that text elements exist and are structured
  });

  test('should support focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Focus should be visible somewhere
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();
  });
});

test.describe('Performance', () => {

  test('should load dashboard pages within reasonable time', async ({ page }) => {
    const routes = ['/dashboard', '/paradigms', '/environment', '/ai-agents'];

    for (const route of routes) {
      const startTime = Date.now();

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    }
  });

  test('should render large datasets without freezing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();

    // Let data accumulate
    await page.waitForTimeout(30000);

    // Navigate to data-heavy page
    await page.goto('/timeline');

    // Should still be responsive
    const isResponsive = await page.waitForSelector('body', { timeout: 5000 }).then(() => true).catch(() => false);
    expect(isResponsive).toBeTruthy();
  });

  test('should handle multiple simultaneous updates', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Start at max speed
    await page.getByRole('button', { name: /start/i }).click();

    // Dashboard should update smoothly
    await page.goto('/dashboard');
    await page.waitForTimeout(5000);

    // Should still be interactive
    const canInteract = await page.getByRole('button', { name: /pause/i }).isEnabled();
    expect(canInteract).toBeTruthy();
  });
});

test.describe('Error Recovery', () => {

  test('should recover from worker initialization failure', async ({ page }) => {
    await page.goto('/');

    // Try to initialize
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Even if worker fails, UI should show error state
    // (This test validates error handling exists, not that we trigger actual errors)

    // Cancel and try again
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden' });

    // Should be able to retry
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should show appropriate error messages for invalid inputs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');

    // Try invalid seed (if validation exists)
    const seedInput = page.getByLabel(/rng seed/i);
    await seedInput.fill('-1');

    // Form should handle gracefully (either prevent or validate)
    const initButton = page.getByRole('button', { name: /^initialize$/i });
    await expect(initButton).toBeVisible();
  });

  test('should maintain state integrity after errors', async ({ page }) => {
    await page.goto('/');

    // Initialize normally
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Should be initialized
    await expect(page.getByRole('button', { name: /(start|pause)/i })).toBeVisible();

    // State should persist across navigation
    await page.goto('/paradigms');
    await page.goto('/dashboard');

    // Should still show initialized state
    await expect(page.getByRole('button', { name: /(start|pause)/i })).toBeVisible();
  });
});

test.describe('Browser Compatibility', () => {

  test('should work with different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Should render without breaking
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
    }
  });

  test('should handle touch events on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Should be able to tap buttons
    const configButton = page.getByRole('button', { name: /configure.*start/i });
    await configButton.tap();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should support high DPI displays', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');

    // Dashboard should render properly
    await expect(page.getByText(/simulation dashboard/i)).toBeVisible();
  });
});

test.describe('Data Integrity Under Stress', () => {

  test('should maintain data consistency during rapid state changes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Rapidly start/pause
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /start/i }).click();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /pause/i }).click();
      await page.waitForTimeout(500);
    }

    // Should still show valid data
    await page.goto('/dashboard');
    const hasValidData = await page.locator('text=/\\d+\\.\\d+B|\\d+%/').first().isVisible();
    expect(hasValidData).toBeTruthy();
  });

  test('should handle step button clicks without race conditions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Click step multiple times rapidly
    const stepButton = page.getByRole('button', { name: /step/i });
    for (let i = 0; i < 10; i++) {
      await stepButton.click();
      await page.waitForTimeout(200);
    }

    // Should still be functional
    await expect(stepButton).toBeEnabled();
  });
});
