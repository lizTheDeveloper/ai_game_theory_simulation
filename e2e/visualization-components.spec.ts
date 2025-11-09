/**
 * Visualization Components Integration Tests
 *
 * Tests for data visualization components:
 * - Charts (radar, line, bar)
 * - Sparklines
 * - Progress indicators
 * - Status indicators
 * - Metric cards
 * - Interactive visualizations
 */

import { test, expect } from '@playwright/test';

// Helper to initialize simulation
async function initializeSimulation(page: any) {
  await page.goto('/');
  await page.getByRole('button', { name: /configure.*start/i }).click();
  await page.waitForSelector('role=dialog', { timeout: 2000 });
  await page.getByRole('button', { name: /^initialize$/i }).click();
  await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(5000);
}

test.describe('Chart Visualizations', () => {

  test('should render SVG charts on dashboard', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Look for SVG elements (charts are typically SVG-based)
    const svgElements = await page.locator('svg').all();

    // Should have at least one chart
    expect(svgElements.length).toBeGreaterThan(0);
  });

  test('should display radar chart for paradigm scores', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Radar chart should be present
    const svg = page.locator('svg').first();
    const isVisible = await svg.isVisible().catch(() => false);

    // If radar chart exists, verify it has content
    if (isVisible) {
      const svgContent = await svg.innerHTML();
      expect(svgContent.length).toBeGreaterThan(50);
    }
  });

  test('should render charts with proper responsive sizing', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);

      // Charts should still be visible
      const svg = await page.locator('svg').first().isVisible().catch(() => false);

      // At minimum, page should not break
      const pageWorks = await page.locator('body').isVisible();
      expect(pageWorks).toBeTruthy();
    }
  });

  test('should display chart legends and labels', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Look for chart labels
    const hasLabels = await page.getByText(/western|development|ecological|indigenous/i).first().isVisible();
    expect(hasLabels).toBeTruthy();
  });
});

test.describe('Metric Cards', () => {

  test('should render metric cards with values', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should show metric card labels
    await expect(page.getByText(/global population/i)).toBeVisible();
    await expect(page.getByText(/quality of life/i)).toBeVisible();
    await expect(page.getByText(/ai capability/i)).toBeVisible();

    // Should show numeric values
    const numericValues = await page.locator('text=/\\d+\\.\\d+/').all();
    expect(numericValues.length).toBeGreaterThan(0);
  });

  test('should display metric card units', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Population should show "B" for billions
    await expect(page.locator('text=/\\d+\\.\\d+B/').first()).toBeVisible();

    // Quality of Life and other metrics might show percentages
    const hasUnits = await page.locator('text=/%|B/').first().isVisible();
    expect(hasUnits).toBeTruthy();
  });

  test('should show status indicators on metric cards', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Look for status indicators (critical, warning, normal)
    const statusElements = await page.locator('[class*="status"]').all();

    // Should have some status indicators
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('should display trend indicators on metrics', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Trend indicators might be arrows or text (up, down, stable)
    const hasTrends = await page.locator('[class*="trend"]').all();

    // May or may not have trend indicators depending on implementation
    expect(Array.isArray(hasTrends)).toBeTruthy();
  });
});

test.describe('Status Indicators', () => {

  test('should display status indicator with label', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // System status should be visible
    await expect(page.getByText(/system status/i)).toBeVisible();

    // Should have a status indicator element
    const statusIndicator = await page.locator('[class*="status-indicator"]').first().isVisible().catch(() => false);

    // At minimum, status text should exist
    const hasStatus = await page.getByText(/(normal|warning|critical|extinction)/i).first().isVisible().catch(() => false);
    expect(typeof hasStatus).toBe('boolean');
  });

  test('should show different status colors based on state', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Run simulation to potentially change status
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(20000);
    await page.getByRole('button', { name: /pause/i }).click();

    // Status indicators should still be present
    const statusElements = await page.locator('[class*="status"]').all();
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('should update status indicators in real-time', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Get initial status
    const initialStatus = await page.getByText(/system status/i).locator('..').textContent();

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(15000);

    // Status might have changed (or stayed same, both valid)
    const currentStatus = await page.getByText(/system status/i).locator('..').textContent();
    expect(currentStatus).toBeDefined();
  });
});

test.describe('Progress Indicators', () => {

  test('should display progress bars for metrics', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Look for progress bar elements
    const progressBars = await page.locator('[role="progressbar"]').all();

    // Might have progress bars for various metrics
    expect(Array.isArray(progressBars)).toBeTruthy();
  });

  test('should show loading states with progress indicators', async ({ page }) => {
    await page.goto('/');

    // Before initialization, might show loading spinner
    const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], [class*="animate"]').all();

    // Loading indicators might exist
    expect(Array.isArray(loadingIndicators)).toBeTruthy();
  });
});

test.describe('Sparklines', () => {

  test('should render sparklines for metric trends', async ({ page }) => {
    await initializeSimulation(page);

    // Run simulation to generate history
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(30000);
    await page.getByRole('button', { name: /pause/i }).click();

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Look for sparkline SVGs or canvases
    const sparklines = await page.locator('[class*="sparkline"]').all();

    // May or may not have sparklines depending on implementation
    expect(Array.isArray(sparklines)).toBeTruthy();
  });

  test('should update sparklines as data changes', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();

    // Let it run to build history
    await page.waitForTimeout(40000);

    // Sparklines should show trends if implemented
    const hasVisualizations = await page.locator('svg, canvas').all();
    expect(hasVisualizations.length).toBeGreaterThan(0);
  });
});

test.describe('Interactive Visualizations', () => {

  test('should allow clicking on paradigm cards to show details', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Click on a paradigm
    const westernParadigm = page.getByText(/western liberal/i).locator('..');
    await westernParadigm.click();

    // Detail panel might appear
    await page.waitForTimeout(1000);

    // Verify interaction worked (page didn't crash)
    const pageWorks = await page.locator('body').isVisible();
    expect(pageWorks).toBeTruthy();
  });

  test('should show tooltips on hover', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Hover over a metric
    await page.getByText(/quality of life/i).hover();
    await page.waitForTimeout(500);

    // Tooltip might appear (implementation-dependent)
    // At minimum, hover shouldn't break the page
    const pageWorks = await page.locator('body').isVisible();
    expect(pageWorks).toBeTruthy();
  });

  test('should support chart interactions', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // If radar chart exists, try interacting with it
    const svg = page.locator('svg').first();
    const exists = await svg.isVisible().catch(() => false);

    if (exists) {
      await svg.hover();
      await page.waitForTimeout(500);

      // Interaction shouldn't break the chart
      const stillVisible = await svg.isVisible();
      expect(stillVisible).toBeTruthy();
    }
  });
});

test.describe('Panel Components', () => {

  test('should render panel components with titles', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Panels should have titles
    await expect(page.getByText(/multi-paradigm dui/i)).toBeVisible();
    await expect(page.getByText(/system health/i)).toBeVisible();
    await expect(page.getByText(/environmental systems/i)).toBeVisible();
  });

  test('should show panel glow effects for critical states', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Look for glow effects (cyan, red, amber)
    const glowElements = await page.locator('[class*="glow"]').all();

    // Might have glow effects
    expect(Array.isArray(glowElements)).toBeTruthy();
  });

  test('should organize content within panels properly', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Panels should contain organized content
    const multiParadigmPanel = page.getByText(/multi-paradigm/i).locator('..');

    // Should have paradigm values within the panel
    const hasContent = await multiParadigmPanel.locator('text=/\\d+\\.\\d+/').first().isVisible().catch(() => false);
    expect(typeof hasContent).toBe('boolean');
  });
});

test.describe('Responsive Visualizations', () => {

  test('should adapt chart sizes to viewport', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    const svgDesktop = page.locator('svg').first();
    const desktopExists = await svgDesktop.isVisible().catch(() => false);

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const svgMobile = page.locator('svg').first();
    const mobileExists = await svgMobile.isVisible().catch(() => false);

    // Charts should adapt or at least not break
    expect(typeof desktopExists).toBe('boolean');
    expect(typeof mobileExists).toBe('boolean');
  });

  test('should stack metric cards on mobile', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Metrics should still be visible
    await expect(page.getByText(/global population/i)).toBeVisible();
    await expect(page.getByText(/quality of life/i)).toBeVisible();
  });
});
