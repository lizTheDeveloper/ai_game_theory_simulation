/**
 * Enable GitHub Wiki Feature
 *
 * This script uses Playwright to navigate to GitHub repo settings
 * and enable the Wiki feature.
 *
 * Usage: npx tsx scripts/enable-github-wiki.ts
 */

import { chromium } from '@playwright/test';

async function enableGitHubWiki() {
  console.log('🚀 Starting browser...');

  const browser = await chromium.launch({
    headless: false, // Show browser so user can authenticate if needed
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📂 Navigating to GitHub repo settings...');
    await page.goto('https://github.com/lizTheDeveloper/ai_game_theory_simulation/settings');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    console.log('🔍 Looking for Features section...');

    // Scroll to Features section
    const featuresHeading = page.locator('h2:has-text("Features")');
    if (await featuresHeading.count() > 0) {
      await featuresHeading.scrollIntoViewIfNeeded();
      console.log('✅ Found Features section');
    } else {
      console.log('⚠️  Features heading not found, continuing anyway...');
    }

    // Find the Wikis checkbox
    console.log('🔍 Looking for Wikis checkbox...');

    // Try multiple selectors for the checkbox
    const selectors = [
      'input[name="wikis_enabled"]',
      'input[type="checkbox"][value="wikis"]',
      'label:has-text("Wikis") input[type="checkbox"]',
      '#repository-features-wikis',
    ];

    let checkbox = null;
    for (const selector of selectors) {
      const found = page.locator(selector);
      if (await found.count() > 0) {
        checkbox = found;
        console.log(`✅ Found checkbox with selector: ${selector}`);
        break;
      }
    }

    if (!checkbox) {
      console.log('❌ Could not find Wikis checkbox');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'logs/github-settings-screenshot.png', fullPage: true });
      console.log('   Screenshot saved to: logs/github-settings-screenshot.png');
      console.log('\n⚠️  Manual steps:');
      console.log('   1. Look for "Features" section on the settings page');
      console.log('   2. Find the "Wikis" checkbox');
      console.log('   3. Check the box if unchecked');
      console.log('   4. The changes save automatically');

      // Keep browser open for manual intervention
      console.log('\n⏸️  Browser will stay open. Enable Wiki manually, then close the browser.');
      await page.pause();
      return;
    }

    // Check if already enabled
    const isChecked = await checkbox.isChecked();

    if (isChecked) {
      console.log('✅ Wikis feature is already enabled!');
    } else {
      console.log('📝 Enabling Wikis feature...');
      await checkbox.check();

      // Wait a moment for the change to save (GitHub auto-saves)
      await page.waitForTimeout(2000);

      // Verify it's checked
      const nowChecked = await checkbox.isChecked();
      if (nowChecked) {
        console.log('✅ Wikis feature enabled successfully!');
      } else {
        console.log('❌ Failed to enable Wikis feature');
        console.log('   Please enable manually in the browser window');
        await page.pause();
      }
    }

    console.log('\n🎉 Done! Your wiki is now available at:');
    console.log('   https://github.com/lizTheDeveloper/ai_game_theory_simulation/wiki');

    console.log('\n📚 Next steps:');
    console.log('   1. Commit and push changes to docs/wiki/');
    console.log('   2. GitHub Action will auto-sync to Wiki');
    console.log('   3. Or run: bash scripts/manual-wiki-sync.sh');

    // Keep browser open for 5 seconds so user can see result
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'logs/github-settings-error.png', fullPage: true });
    console.log('   Screenshot saved to: logs/github-settings-error.png');

    // Keep browser open for debugging
    console.log('\n⏸️  Browser will stay open for manual intervention');
    await page.pause();
  } finally {
    await browser.close();
  }
}

// Run the script
enableGitHubWiki().catch(console.error);
