/**
 * Dashboard Navigation Integration Tests
 *
 * Tests navigation, routing, keyboard shortcuts, and core layout functionality.
 * Validates that all dashboard pages are accessible and maintain consistent state.
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Dashboard Navigation & Layout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page and display navigation sidebar', async ({ page }) => {
    // Verify navigation sidebar is visible
    await expect(page.getByText('Simulation Dashboard')).toBeVisible();
    await expect(page.getByText('Research Tool')).toBeVisible();

    // Verify all main navigation items are present
    const navItems = [
      'Overview',
      'Paradigms',
      'AI Agents',
      'Crises',
      'Environment',
      'Tech Tree',
      'Detection',
      'Regions',
      'Timeline',
      'Real-Time'
    ];

    for (const item of navItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }

    // Verify utility links
    await expect(page.getByRole('link', { name: /documentation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /monte carlo/i })).toBeVisible();
  });

  test('should navigate to all dashboard pages via sidebar links', async ({ page }) => {
    const routes = [
      { name: 'Overview', path: '/dashboard' },
      { name: 'Paradigms', path: '/paradigms' },
      { name: 'AI Agents', path: '/ai-agents' },
      { name: 'Crises', path: '/crises' },
      { name: 'Environment', path: '/environment' },
      { name: 'Tech Tree', path: '/tech-tree' },
      { name: 'Detection', path: '/detection' },
      { name: 'Regions', path: '/regions' },
      { name: 'Timeline', path: '/timeline' },
    ];

    for (const route of routes) {
      await page.getByRole('link', { name: route.name }).click();
      await page.waitForURL(`**${route.path}`);
      expect(page.url()).toContain(route.path);

      // Verify no 404 or error states
      await expect(page.locator('text=/404|not found/i')).not.toBeVisible();
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to Paradigms
    await page.getByRole('link', { name: 'Paradigms' }).click();
    await page.waitForURL('**/paradigms');

    // Active link should have specific styling
    const paradigmsLink = page.getByRole('link', { name: 'Paradigms' });
    await expect(paradigmsLink).toHaveClass(/glow-cyan/);

    // Navigate to Environment
    await page.getByRole('link', { name: 'Environment' }).click();
    await page.waitForURL('**/environment');

    const environmentLink = page.getByRole('link', { name: 'Environment' });
    await expect(environmentLink).toHaveClass(/glow-cyan/);

    // Paradigms should no longer be active
    await expect(paradigmsLink).not.toHaveClass(/glow-cyan/);
  });

  test('should display keyboard shortcuts in footer', async ({ page }) => {
    await expect(page.getByText(/keyboard.*0-9.*navigate/i)).toBeVisible();
    await expect(page.getByText(/spacebar.*pause.*play/i)).toBeVisible();
  });

  test('should show "Configure & Start" button before initialization', async ({ page }) => {
    const configButton = page.getByRole('button', { name: /configure.*start/i });
    await expect(configButton).toBeVisible();

    // Should not show control buttons
    await expect(page.getByRole('button', { name: /^pause$/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /^start$/i })).not.toBeVisible();
  });

  test('should preserve navigation state when switching pages', async ({ page }) => {
    // Verify navigation persists
    await page.goto('/paradigms');
    await expect(page.getByText('Simulation Dashboard')).toBeVisible();

    await page.goto('/environment');
    await expect(page.getByText('Simulation Dashboard')).toBeVisible();

    // Navigation should always be present
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  });

  test('should link to external resources', async ({ page }) => {
    const multiverseLink = page.getByRole('link', { name: /multiverse school/i });
    await expect(multiverseLink).toBeVisible();
    await expect(multiverseLink).toHaveAttribute('href', 'https://themultiverse.school');
    await expect(multiverseLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Dashboard Routing', () => {

  test('should handle direct navigation to dashboard pages', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/paradigms',
      '/ai-agents',
      '/crises',
      '/environment',
      '/tech-tree',
      '/detection',
      '/regions',
      '/timeline',
      '/realtime',
    ];

    for (const route of routes) {
      await page.goto(route);

      // Should not show 404
      await expect(page.locator('text=/404|not found/i')).not.toBeVisible();

      // Should show either loading state or content
      const hasContent = await page.locator('text=/loading|not initialized|waiting|configure/i').first().isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should maintain correct URL when navigating', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Paradigms' }).click();
    expect(page.url()).toContain('/paradigms');

    await page.getByRole('link', { name: 'Environment' }).click();
    expect(page.url()).toContain('/environment');

    // Browser back button should work
    await page.goBack();
    expect(page.url()).toContain('/paradigms');

    // Browser forward button should work
    await page.goForward();
    expect(page.url()).toContain('/environment');
  });
});

test.describe('Responsive Layout', () => {

  test('should display navigation on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Navigation should be visible and properly sized
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Should have fixed left positioning
    await expect(nav).toHaveCSS('position', 'fixed');
  });

  test('should handle tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Navigation should still be accessible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should handle mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should render without breaking
    await expect(page.getByText('Simulation Dashboard')).toBeVisible();
  });
});
