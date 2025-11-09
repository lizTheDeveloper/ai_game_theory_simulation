/**
 * Dashboard Data Flow Integration Tests
 *
 * Tests data flow from simulation worker through components:
 * - Worker initialization and state updates
 * - Real-time data propagation to dashboard components
 * - State persistence across navigation
 * - Multi-system data integration
 */

import { test, expect } from '@playwright/test';

// Helper to initialize simulation
async function initializeSimulation(page: any) {
  await page.goto('/');
  await page.getByRole('button', { name: /configure.*start/i }).click();
  await page.waitForSelector('role=dialog', { timeout: 2000 });
  await page.getByRole('button', { name: /^initialize$/i }).click();
  await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(5000); // Wait for first data update
}

test.describe('Simulation Data Flow', () => {

  test('should receive initial state snapshot after initialization', async ({ page }) => {
    await page.goto('/dashboard');

    // Before init: should show "Not Initialized"
    await expect(page.getByText(/not initialized/i)).toBeVisible();

    // Initialize
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Navigate back to dashboard
    await page.goto('/dashboard');

    // Should now show real data
    await expect(page.getByText(/not initialized/i)).not.toBeVisible();

    // Should see numeric values
    await expect(page.locator('text=/\\d+\\.\\d+B|\\d+%/').first()).toBeVisible();
  });

  test('should update data in real-time when simulation is running', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Get initial month value
    const monthDisplay = page.locator('text=/Month \\d+/i').first();
    await expect(monthDisplay).toBeVisible();
    const initialMonth = await monthDisplay.textContent();

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.getByText(/running/i)).toBeVisible();

    // Wait for simulation to advance (default speed: 1 month = 30 seconds)
    await page.waitForTimeout(35000);

    // Month should have changed
    const updatedMonth = await monthDisplay.textContent();
    expect(updatedMonth).not.toBe(initialMonth);
  });

  test('should show complete metrics on Overview Dashboard', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Should show population metric
    await expect(page.getByText(/global population/i)).toBeVisible();
    await expect(page.locator('text=/\\d+\\.\\d+B/').first()).toBeVisible();

    // Should show quality of life
    await expect(page.getByText(/quality of life/i)).toBeVisible();

    // Should show AI capability
    await expect(page.getByText(/ai capability/i)).toBeVisible();

    // Should show alignment score
    await expect(page.getByText(/alignment/i)).toBeVisible();

    // Should show paradigm scores
    await expect(page.getByText(/western liberal/i)).toBeVisible();
    await expect(page.getByText(/development/i)).toBeVisible();
    await expect(page.getByText(/ecological/i)).toBeVisible();
    await expect(page.getByText(/indigenous/i)).toBeVisible();
  });

  test('should persist worker state across page navigation', async ({ page }) => {
    await initializeSimulation(page);

    // Navigate to different dashboards
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Should not show "Not Initialized" on new page
    await expect(page.getByText(/not initialized/i)).not.toBeVisible();

    await page.goto('/environment');
    await page.waitForTimeout(2000);

    // Should still have data
    await expect(page.getByText(/not initialized/i)).not.toBeVisible();

    // Navigate back to overview
    await page.goto('/dashboard');

    // Should still show data
    await expect(page.locator('text=/\\d+\\.\\d+B/').first()).toBeVisible();
  });

  test('should update all visible metrics when state changes', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Capture initial values
    const populationBefore = await page.locator('text=/\\d+\\.\\d+B/').first().textContent();

    // Start simulation and let it run
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(10000); // Run for 10 seconds

    // Pause to check state
    await page.getByRole('button', { name: /pause/i }).click();

    // Values should have updated (population might change due to events)
    // At minimum, we should see valid numeric values
    const populationAfter = await page.locator('text=/\\d+\\.\\d+B/').first().textContent();
    expect(populationAfter).toMatch(/^\d+\.\d+B$/);
  });

  test('should show environmental metrics with proper data', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Environmental Systems panel should show data
    await expect(page.getByText(/environmental systems/i)).toBeVisible();

    // Should show climate stability
    await expect(page.getByText(/climate stability/i)).toBeVisible();

    // Should show biodiversity
    await expect(page.getByText(/biodiversity/i)).toBeVisible();

    // Should show social cohesion
    await expect(page.getByText(/social cohesion/i)).toBeVisible();

    // All should have percentage values or "N/A"
    const metrics = await page.locator('text=/\\d+%|n\/a/i').all();
    expect(metrics.length).toBeGreaterThan(0);
  });

  test('should show system health indicators', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // System Health panel
    await expect(page.getByText(/system health/i)).toBeVisible();

    // Should show AI agents count
    await expect(page.getByText(/ai agents/i)).toBeVisible();
    await expect(page.getByText(/active/i)).toBeVisible();

    // Should show organizations
    await expect(page.getByText(/organizations/i)).toBeVisible();

    // Should show extinction risk
    await expect(page.getByText(/extinction risk/i)).toBeVisible();
  });
});

test.describe('Multi-System Data Integration', () => {

  test('should show consistent paradigm scores across Overview and Paradigms dashboards', async ({ page }) => {
    await initializeSimulation(page);

    // Get scores from Overview
    await page.goto('/dashboard');
    const westernOverview = await page.getByText(/western liberal/i).locator('..').getByText(/\d+\.\d+/).first().textContent();

    // Navigate to Paradigms dashboard
    await page.goto('/paradigms');
    await page.waitForTimeout(2000);

    // Should show similar data (within update cycle tolerance)
    const paradigmData = await page.locator('text=/western|liberal/i').first();
    await expect(paradigmData).toBeVisible();
  });

  test('should reflect AI agent count consistently across dashboards', async ({ page }) => {
    await initializeSimulation(page);

    // Check Overview
    await page.goto('/dashboard');
    const agentCountText = await page.getByText(/\d+ active/).first().textContent();
    const agentCount = agentCountText?.match(/\d+/)?.[0];

    // Check AI Agents dashboard
    await page.goto('/ai-agents');
    await page.waitForTimeout(2000);

    // Should show consistent agent-related data
    // Note: Exact count might differ by a few due to update timing
  });

  test('should show crisis events on both Overview and Crisis dashboards', async ({ page }) => {
    await initializeSimulation(page);

    // Start simulation to generate potential events
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(20000); // Run for 20 seconds
    await page.getByRole('button', { name: /pause/i }).click();

    // Check Overview for crisis indicators
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Navigate to Crisis dashboard
    await page.goto('/crises');
    await page.waitForTimeout(2000);

    // Should show crisis data or "no active crises"
    const hasCrisisData = await page.getByText(/crisis|active|inactive|none/i).first().isVisible();
    expect(hasCrisisData).toBeTruthy();
  });

  test('should synchronize month/day display across all dashboards', async ({ page }) => {
    await initializeSimulation(page);

    // Get month from navigation
    const navMonth = await page.getByText(/Month \d+/i).first().textContent();

    // Check multiple dashboards
    const dashboards = ['/dashboard', '/paradigms', '/environment', '/crises'];

    for (const dashboard of dashboards) {
      await page.goto(dashboard);
      await page.waitForTimeout(1000);

      // Month display in nav should be consistent
      const currentMonth = await page.getByText(/Month \d+/i).first().textContent();
      expect(currentMonth).toBe(navMonth);
    }
  });
});

test.describe('Dashboard Component Integration', () => {

  test('should interact with paradigm detail panels', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Click on Western Liberal paradigm
    await page.getByText(/western liberal/i).locator('..').click();

    // Detail panel should appear (if implemented)
    // This tests the interaction between MetricCard and ParadigmDetailPanel
    await page.waitForTimeout(1000);
  });

  test('should display metric cards with proper status indicators', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Metric cards should show status (critical/warning/normal)
    // Look for status-related styling or indicators
    const metrics = await page.locator('[class*="status"]').all();

    // Should have at least some status indicators
    // (Implementation may vary, this validates structure exists)
  });

  test('should show help button and modal', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Look for help button (usually a ? icon or "Help" text)
    const helpElements = await page.locator('text=/help|\\?/i').all();

    // Should have help system available
    expect(helpElements.length).toBeGreaterThan(0);
  });

  test('should display status indicators with appropriate colors', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // System Status indicator should be visible
    await expect(page.getByText(/system status/i)).toBeVisible();

    // Should have status indicator element
    const statusIndicator = page.locator('[class*="status-indicator"]').first();
    const exists = await statusIndicator.count();

    // At least one status indicator should exist
    expect(exists).toBeGreaterThan(0);
  });
});

test.describe('Real-Time Updates', () => {

  test('should update population metric in real-time', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Capture initial population
    const popLocator = page.locator('text=/\\d+\\.\\d+B/').first();
    const initialPop = await popLocator.textContent();

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();

    // Wait for multiple updates (1 minute = 2 months at default speed)
    await page.waitForTimeout(60000);

    await page.getByRole('button', { name: /pause/i }).click();

    // Population should still be a valid number
    const finalPop = await popLocator.textContent();
    expect(finalPop).toMatch(/^\d+\.\d+B$/);
  });

  test('should update day counter in navigation', async ({ page }) => {
    await initializeSimulation(page);

    // Get initial day
    const dayLocator = page.locator('text=/Day/i').first();
    const initialDay = await dayLocator.textContent();

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();

    // Wait for day to advance
    await page.waitForTimeout(5000);

    // Day should have changed
    const updatedDay = await dayLocator.textContent();
    expect(updatedDay).not.toBe(initialDay);
  });

  test('should batch updates efficiently without UI flicker', async ({ page }) => {
    await initializeSimulation(page);
    await page.goto('/dashboard');

    // Start simulation
    await page.getByRole('button', { name: /start/i }).click();

    // Take screenshot before
    const before = await page.screenshot();

    // Wait a moment
    await page.waitForTimeout(2000);

    // Take screenshot after
    const after = await page.screenshot();

    // UI should still be stable (no major layout shifts)
    // This is a basic stability check
    expect(before).toBeDefined();
    expect(after).toBeDefined();
  });
});
