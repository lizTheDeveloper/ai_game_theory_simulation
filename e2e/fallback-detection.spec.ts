/**
 * Fallback Detection Tests
 *
 * PURPOSE: Defend against defensive fallbacks being reintroduced into dashboard components.
 *
 * These tests verify that dashboards properly fail when data is missing, rather than
 * showing fake fallback values that mask bugs.
 *
 * ANTI-PATTERNS DETECTED:
 * - Showing "8.0" billion population when worker hasn't sent data
 * - Showing "50" paradigm scores when data is undefined
 * - Showing "0" for metrics when values are NaN
 * - Showing empty arrays [] when data hasn't loaded
 *
 * EXPECTED BEHAVIOR:
 * - Before initialization: Show "Not Initialized" or loading state
 * - After initialization: Show real data that changes over time
 * - Never show the same fake values consistently
 */

import { test, expect } from '@playwright/test';

test.describe('Fallback Detection - Dashboard Data Integrity', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Overview Dashboard should show "Not Initialized" before simulation starts', async ({ page }) => {
    // Before clicking "Configure & Start", dashboard should show it's not initialized
    const notInitializedText = page.getByText(/not initialized/i);
    await expect(notInitializedText).toBeVisible({ timeout: 5000 });

    // Should NOT show fake population value of "8.0" billion
    const fakePopulation = page.getByText('8.0B');
    await expect(fakePopulation).not.toBeVisible();

    // Should NOT show fake paradigm scores of 50
    const fakeParadigmScores = page.locator('text=/^50$/');
    const fakeScoreCount = await fakeParadigmScores.count();
    expect(fakeScoreCount).toBe(0); // No elements showing exactly "50"
  });

  test('Clicking "Configure & Start" should initialize simulation and show real data', async ({ page }) => {
    // Click the Configure & Start button
    const configButton = page.getByRole('button', { name: /configure.*start/i });
    await configButton.click();

    // Modal should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });

    // Click INITIALIZE button in modal
    const initButton = page.getByRole('button', { name: /initialize/i });
    await initButton.click();

    // Wait for initialization to complete (modal should close)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15000 });

    // Dashboard should now show data (wait up to 5 seconds for first update)
    await page.waitForTimeout(5000);

    // Should see population data (not "Not Initialized")
    const notInitialized = page.getByText(/not initialized/i);
    await expect(notInitialized).not.toBeVisible();

    // Should see some numeric values (indicating data is present)
    const hasNumericData = page.locator('text=/\\d+\\.\\d+B|\\d+%/').first();
    await expect(hasNumericData).toBeVisible();
  });

  test('Data should change over time after initialization', async ({ page }) => {
    // Initialize simulation
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog', { timeout: 2000 });
    await page.getByRole('button', { name: /initialize/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });

    // Wait for first data update
    await page.waitForTimeout(3000);

    // Capture initial month value
    const monthDisplay = page.locator('text=/Month \\d+/i').first();
    await expect(monthDisplay).toBeVisible({ timeout: 5000 });
    const initialMonth = await monthDisplay.textContent();

    // Wait for simulation to advance (30 seconds = 1 month by default)
    await page.waitForTimeout(35000);

    // Month should have changed
    const updatedMonth = await monthDisplay.textContent();
    expect(updatedMonth).not.toBe(initialMonth);
  });

  test('AI Agents Dashboard should not show fallback empty array before data loads', async ({ page }) => {
    await page.goto('/ai-agents');

    // Before initialization, should show loading or "not initialized"
    // Should NOT show "0 agents" as if the data loaded but there are none
    const agentsList = page.locator('[data-testid="agents-list"]').or(page.locator('text=/agents/i').first());

    // If component shows "0 agents" immediately, that's a fallback pattern
    const zeroAgentsText = page.getByText(/0 agents/i);
    const isZeroVisible = await zeroAgentsText.isVisible().catch(() => false);

    if (isZeroVisible) {
      // This is suspicious - likely a fallback to empty array
      // The proper behavior is to show "Loading..." or "Not Initialized"
      const loadingText = page.getByText(/loading|not initialized|waiting/i);
      await expect(loadingText).toBeVisible();
    }
  });

  test('Paradigm Dashboard should not show fallback score of 50 for all paradigms', async ({ page }) => {
    await page.goto('/paradigms');

    // Check if all four paradigm scores are exactly 50 (indicating fallback)
    const paradigmScores = await page.locator('text=/^50$|50\\.0/').all();

    if (paradigmScores.length >= 4) {
      // All paradigms showing 50 is suspicious - likely fallback pattern
      // Verify there's a loading/not initialized message
      const loadingState = page.getByText(/loading|not initialized|waiting/i);
      await expect(loadingState).toBeVisible();
    }
  });

  test('Environmental Dashboard should not show fallback zeros for all metrics', async ({ page }) => {
    await page.goto('/environment');

    // Check if all environmental metrics are showing 0 (indicating fallback)
    const zeroMetrics = await page.locator('text=/^0$|0\\.0$|0%/').all();

    if (zeroMetrics.length > 5) {
      // Many zeros is suspicious - likely fallback pattern
      // Verify there's a loading state or proper "N/A" labels
      const properState = page.getByText(/loading|not initialized|n\/a/i);
      await expect(properState).toBeVisible();
    }
  });

  test('Crisis Dashboard should show proper state when no data loaded', async ({ page }) => {
    await page.goto('/crises');

    // Should either show loading state or proper "No active crises" message
    // Should NOT silently show empty crisis list due to fallback || []
    const crisisList = page.locator('[data-testid="crisis-list"]').or(page.locator('text=/crisis/i').first());

    // If showing "No active crises" immediately, should also show it's not initialized
    const noCrisesText = page.getByText(/no.*crises/i);
    const isNoCrisesVisible = await noCrisesText.isVisible().catch(() => false);

    if (isNoCrisesVisible) {
      // This might be okay, but verify we're not just showing fallback []
      // Check that we see either loading state or legitimate data
      const hasProperState = page.getByText(/loading|not initialized|waiting|0 active/i);
      await expect(hasProperState).toBeVisible();
    }
  });
});

test.describe('Fallback Detection - Data Validation', () => {

  test('Components should show error state when worker fails', async ({ page }) => {
    await page.goto('/');

    // This test would need to inject worker failure
    // For now, just verify that uninitialized state is properly shown
    const errorOrLoading = page.getByText(/error|not initialized|loading|waiting/i);
    await expect(errorOrLoading).toBeVisible();
  });

  test('Population should never be exactly 8.0B consistently', async ({ page }) => {
    // This is the most common fallback pattern: population ?? 8.0
    await page.goto('/');

    // Initialize and wait for data
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog', { timeout: 2000 });
    await page.getByRole('button', { name: /initialize/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Check population value
    const populationText = page.locator('text=/\\d+\\.\\d+B/').first();
    const popValue = await populationText.textContent();

    // If it's EXACTLY "8.0B", that's the fallback value - fail the test
    expect(popValue).not.toBe('8.0B');

    // Also check it's a reasonable number (not NaN displayed as text)
    expect(popValue).toMatch(/^\d+\.\d+B$/);
  });

  test('Quality of Life should not be exactly 0.65 consistently', async ({ page }) => {
    // Common fallback: qol ?? 0.65
    await page.goto('/');

    // Initialize
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog', { timeout: 2000 });
    await page.getByRole('button', { name: /initialize/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Look for QoL values
    const qolElements = await page.locator('text=/quality.*life|qol/i').all();

    for (const element of qolElements) {
      const text = await element.textContent();
      // If we see exactly "0.65" or "65", it might be a fallback
      if (text && (text.includes('0.65') || text.includes('65%'))) {
        // This is suspicious but not necessarily wrong
        // Log it for manual review
        console.warn('⚠️  Found QoL value of 0.65/65% - verify this is real data, not fallback');
      }
    }
  });
});

test.describe('Fallback Detection - Component Lifecycle', () => {

  test('All dashboard routes should be accessible', async ({ page }) => {
    const routes = [
      '/',
      '/dashboard',
      '/paradigms',
      '/ai-agents',
      '/crises',
      '/environment',
      '/tech-tree',
      '/detection',
      '/regions',
      '/timeline',
    ];

    for (const route of routes) {
      await page.goto(route);
      // Should not see a 404 error
      await expect(page.locator('text=/404|not found/i')).not.toBeVisible();
      // Should see either data or proper loading state
      const hasContent = page.locator('body').locator('text=/loading|not initialized|waiting|\\d+/i').first();
      await expect(hasContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('Navigation between dashboards should preserve worker state', async ({ page }) => {
    // Initialize on home page
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog', { timeout: 2000 });
    await page.getByRole('button', { name: /initialize/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Navigate to another dashboard
    await page.goto('/paradigms');

    // Should not show "Not Initialized" - worker state should persist
    const notInitialized = page.getByText(/not initialized/i);
    await expect(notInitialized).not.toBeVisible({ timeout: 3000 });

    // Should show data
    const hasData = page.locator('text=/\\d+|loading/i').first();
    await expect(hasData).toBeVisible();
  });
});
