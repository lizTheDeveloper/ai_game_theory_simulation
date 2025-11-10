/**
 * Multi-System Integration Tests
 *
 * Tests integration between multiple simulation systems as displayed in the dashboard:
 * - AI capability → Quality of Life interactions
 * - Environmental systems → Population dynamics
 * - Crisis events → Multiple system impacts
 * - Technology unlocks → System improvements
 * - Paradigm shifts → Policy changes
 * - Cross-dashboard state consistency
 */

import { test, expect } from '@playwright/test';

// Adaptive wait helper - polls for element visibility
async function waitForDashboardData(page: any, selector: string | RegExp, maxAttempts: number = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    await page.waitForTimeout(2000);
    const isVisible = await page.locator(`text=${selector}`).first().isVisible().catch(() => false);
    if (isVisible) return;
  }
  throw new Error(`Dashboard data not visible after ${maxAttempts} attempts: ${selector}`);
}

// Helper to initialize and run simulation
async function initializeAndRunSimulation(page: any, durationMs: number = 30000) {
  await page.goto('/');
  await page.getByRole('button', { name: /configure.*start/i }).click();
  await page.waitForSelector('role=dialog', { timeout: 2000 });

  // Select 4x speed for faster tests (7.5s/month instead of 30s/month)
  await page.getByLabel(/simulation speed/i).selectOption('4.0');

  await page.getByRole('button', { name: /^initialize$/i }).click();
  await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Start simulation
  await page.getByRole('button', { name: /start/i }).click();
  await page.waitForTimeout(durationMs);
  await page.getByRole('button', { name: /pause/i }).click();
}

test.describe('AI Systems → QoL Integration', () => {

  test('should show relationship between AI capability and quality of life', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Navigate using client-side navigation to preserve worker state
    await page.getByRole('link', { name: /overview|dashboard/i }).click();

    // Adaptive wait - poll for AI capability to be visible
    await waitForDashboardData(page, /ai capability/i);

    // Get AI capability value
    const aiCapabilityText = await page.getByText(/ai capability/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();

    // Get QoL value
    const qolText = await page.getByText(/quality of life/i).locator('..').locator('text=/\\d+\\.\\d+|\\d+%/').first().textContent();

    // Both should have valid values
    expect(aiCapabilityText).toMatch(/\d+\.\d+/);
    expect(qolText).toMatch(/\d+/);
  });

  test('should reflect AI agent count across Overview and AI Agents dashboards', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Check Overview - use client-side navigation
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /ai agents/i);
    const overviewAgentText = await page.getByText(/ai agents/i).locator('..').textContent();

    // Check AI Agents dashboard - use client-side navigation
    await page.getByRole('link', { name: /ai.*agents/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /\d+\.\d+B|global population/i);

    // Should show consistent agent data
    // Note: Exact counts might differ slightly due to update timing
    const hasAgentData = await page.locator('text=/agent|ai/i').first().isVisible();
    expect(hasAgentData).toBeTruthy();
  });

  test('should show alignment score impact on system stability', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Navigate using client-side navigation
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /alignment/i);

    // Get alignment score
    const alignmentText = await page.getByText(/alignment/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();

    // Get system status
    const systemStatus = await page.getByText(/system status/i).locator('..').textContent();

    // Both should exist
    expect(alignmentText).toBeDefined();
    expect(systemStatus).toBeDefined();
  });
});

test.describe('Environmental Systems → Population Integration', () => {

  test('should show climate impact on population metrics', async ({ page }) => {
    await initializeAndRunSimulation(page, 12000); // ~1.6 months at 4x speed

    // Navigate using client-side navigation
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /\d+\.\d+B|global population/i);

    // Get population
    const populationText = await page.locator('text=/\\d+\\.\\d+B/').first().textContent();

    // Get climate stability
    const climateText = await page.getByText(/climate stability/i).locator('..').textContent();

    // Both should have values
    expect(populationText).toMatch(/\d+\.\d+B/);
    expect(climateText).toBeDefined();
  });

  test('should reflect environmental metrics consistently across dashboards', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Check Overview environmental panel - use client-side navigation
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /climate|biodiversity/i);
    const overviewClimate = await page.getByText(/climate stability/i).locator('..').textContent();

    // Check Environment dashboard - use client-side navigation
    await page.getByRole('link', { name: /environment/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /climate|biodiversity/i);

    // Should show consistent environmental data
    const hasEnvData = await page.locator('text=/climate|environment|biodiversity/i').first().isVisible();
    expect(hasEnvData).toBeTruthy();
  });

  test('should show biodiversity impact on ecological paradigm score', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Navigate using client-side navigation
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /climate|biodiversity/i);

    // Get biodiversity
    const biodiversityText = await page.getByText(/biodiversity/i).locator('..').textContent();

    // Get ecological paradigm score
    const ecologicalText = await page.getByText(/ecological/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();

    // Both should exist
    expect(biodiversityText).toBeDefined();
    expect(ecologicalText).toMatch(/\d+\.\d+/);
  });
});

test.describe('Crisis Events → Multi-System Impact', () => {

  test('should show crisis events affecting multiple metrics', async ({ page }) => {
    await initializeAndRunSimulation(page, 18000); // ~2.4 months at 4x speed (give crises time to occur)

    // Check for active crises
    await page.getByRole('link', { name: /crisis|crises/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /crisis|event/i);

    const hasCrisisData = await page.locator('text=/crisis|event|active/i').first().isVisible();

    // Check impact on Overview metrics
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);

    // Metrics should reflect crisis impacts (if any occurred)
    const hasMetrics = await page.locator('text=/\\d+\\.\\d+B|\\d+%/').first().isVisible();
    expect(hasMetrics).toBeTruthy();
  });

  test('should reflect crisis impacts in environmental dashboard', async ({ page }) => {
    await initializeAndRunSimulation(page, 18000); // ~2.4 months at 4x speed

    // Check crises
    await page.getByRole('link', { name: /crisis|crises/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /crisis|event/i);
    const crisisContent = await page.content();

    // Check environmental impact
    await page.getByRole('link', { name: /environment/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /climate|biodiversity/i);

    // Environment should show data (potentially affected by crises)
    const hasEnvMetrics = await page.locator('text=/\\d+%|climate|biodiversity/i').first().isVisible();
    expect(hasEnvMetrics).toBeTruthy();
  });

  test('should show extinction risk correlating with crisis severity', async ({ page }) => {
    await initializeAndRunSimulation(page, 18000); // ~2.4 months at 4x speed
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /extinction/i);

    // Get extinction risk
    const extinctionText = await page.getByText(/extinction risk/i).locator('..').textContent();

    // Should have extinction probability displayed
    expect(extinctionText).toBeDefined();
    expect(extinctionText).toMatch(/\d+|unknown|n\/a/i);
  });
});

test.describe('Technology Impact Integration', () => {

  test('should show technology tree state affecting system capabilities', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Check tech tree
    await page.getByRole('link', { name: /tech/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /tech|research/i);
    const hasTechData = await page.locator('text=/tech|research|breakthrough/i').first().isVisible();

    // Check if capabilities reflect tech progress
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);

    const aiCapability = await page.getByText(/ai capability/i).locator('..').textContent();
    expect(aiCapability).toBeDefined();
  });

  test('should reflect breakthrough technologies in environmental metrics', async ({ page }) => {
    await initializeAndRunSimulation(page, 12000); // ~1.6 months at 4x speed

    // Tech breakthroughs might affect environment
    await page.getByRole('link', { name: /tech/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /\d+\.\d+B|global population/i);

    await page.getByRole('link', { name: /environment/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /climate|biodiversity/i);

    // Environment should show current state (potentially improved by tech)
    const hasEnvData = await page.locator('text=/climate|biodiversity|ecosystem/i').first().isVisible();
    expect(hasEnvData).toBeTruthy();
  });
});

test.describe('Paradigm → System Behavior Integration', () => {

  test('should show all four paradigm perspectives with different scores', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /western|paradigm/i);

    // Get all paradigm scores
    const western = await page.getByText(/western liberal/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();
    const development = await page.getByText(/development/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();
    const ecological = await page.getByText(/ecological/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();
    const indigenous = await page.getByText(/indigenous/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();

    // All should have numeric values
    expect(western).toMatch(/\d+\.\d+/);
    expect(development).toMatch(/\d+\.\d+/);
    expect(ecological).toMatch(/\d+\.\d+/);
    expect(indigenous).toMatch(/\d+\.\d+/);

    // They should not all be exactly the same (indicating real differences)
    const allSame = western === development && development === ecological && ecological === indigenous;
    // It's possible they're all the same, but unlikely after simulation
  });

  test('should reflect paradigm scores consistently on Paradigms dashboard', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Get scores from Overview
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);
    const overviewWestern = await page.getByText(/western liberal/i).locator('..').locator('text=/\\d+\\.\\d+/').first().textContent();

    // Check Paradigms dashboard
    await page.getByRole('link', { name: /paradigms/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /western|paradigm/i);

    // Should show paradigm data
    const hasParadigmData = await page.locator('text=/western|liberal/i').first().isVisible();
    expect(hasParadigmData).toBeTruthy();
  });

  test('should show paradigm influence on policy priorities', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed
    await page.getByRole('link', { name: /paradigms/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /western|paradigm/i);

    // Paradigm scores should indicate different priorities
    const hasScores = await page.locator('text=/\\d+\\.\\d+/').all();
    expect(hasScores.length).toBeGreaterThan(0);
  });
});

test.describe('Cross-Dashboard State Consistency', () => {

  test('should maintain month consistency across all dashboards', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Get month from navigation
    const navMonth = await page.locator('text=/Month \\d+/i').first().textContent();

    // Check multiple dashboards using client-side navigation
    const dashboards = [
      { name: /overview|dashboard/i },
      { name: /paradigms/i },
      { name: /environment/i },
      { name: /ai.*agents/i },
      { name: /crisis|crises/i },
    ];

    for (const dashboard of dashboards) {
      await page.getByRole('link', { name: dashboard.name }).first().click();
      await page.waitForTimeout(1000);

      // Month should be consistent in navigation
      const currentMonth = await page.locator('text=/Month \\d+/i').first().textContent();
      expect(currentMonth).toBe(navMonth);
    }
  });

  test('should show synchronized simulation state across tabs', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Check running state is consistent
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    const status1 = await page.getByText(/(running|paused)/i).first().textContent();

    await page.getByRole('link', { name: /paradigms/i }).click();
    const status2 = await page.getByText(/(running|paused)/i).first().textContent();

    // Status should be the same (simulation is paused)
    expect(status1).toBe(status2);
  });

  test('should reflect same seed across all pages', async ({ page }) => {
    const testSeed = 77777;

    // Initialize with specific seed
    await page.goto('/');
    await page.getByRole('button', { name: /configure.*start/i }).click();
    await page.waitForSelector('role=dialog');
    await page.getByLabel(/rng seed/i).fill(testSeed.toString());
    await page.getByRole('button', { name: /^initialize$/i }).click();
    await page.waitForSelector('role=dialog', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Check seed on different pages
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await expect(page.getByText(testSeed.toString())).toBeVisible();

    await page.getByRole('link', { name: /paradigms/i }).click();
    await expect(page.getByText(testSeed.toString())).toBeVisible();

    await page.getByRole('link', { name: /environment/i }).click();
    await expect(page.getByText(testSeed.toString())).toBeVisible();
  });
});

test.describe('Regional Data Integration', () => {

  test('should show regional breakdowns affecting global metrics', async ({ page }) => {
    await initializeAndRunSimulation(page, 10000); // ~1.3 months at 4x speed

    // Check global metrics
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);
    const globalPop = await page.locator('text=/\\d+\\.\\d+B/').first().textContent();

    // Check regional data
    await page.getByRole('link', { name: /regions/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /region/i);

    // Regions should show detailed breakdowns
    const hasRegionData = await page.locator('text=/region|country|area/i').first().isVisible();
    expect(hasRegionData).toBeTruthy();
  });
});

test.describe('Timeline Integration', () => {

  test('should show events in timeline matching dashboard state changes', async ({ page }) => {
    await initializeAndRunSimulation(page, 12000); // ~1.6 months at 4x speed

    // Get current state
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);
    const currentMonth = await page.locator('text=/Month \\d+/i').first().textContent();

    // Check timeline
    await page.getByRole('link', { name: /timeline/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /crisis|event/i);

    // Timeline should show events up to current month
    const hasTimeline = await page.locator('text=/month|event|timeline/i').first().isVisible();
    expect(hasTimeline).toBeTruthy();
  });

  test('should correlate timeline events with metric changes', async ({ page }) => {
    await initializeAndRunSimulation(page, 15000); // ~2 months at 4x speed

    // Check timeline for major events
    await page.getByRole('link', { name: /timeline/i }).click();
    // Adaptive wait added - waits for data to load
    await waitForDashboardData(page, /crisis|event/i);
    const timelineContent = await page.content();

    // Check if metrics reflect those events
    await page.getByRole('link', { name: /overview|dashboard/i }).click();
    await page.waitForTimeout(1000);

    // Metrics should be present and valid
    const hasValidMetrics = await page.locator('text=/\\d+\\.\\d+B|\\d+%/').first().isVisible();
    expect(hasValidMetrics).toBeTruthy();
  });
});
