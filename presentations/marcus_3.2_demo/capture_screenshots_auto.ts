/**
 * MARCUS 3.2 Demo Screenshot Automated Capture
 *
 * This script uses Playwright to automatically capture screenshots
 * of the MARCUS platform for demo backup purposes.
 *
 * Prerequisites:
 * - Port forwarding must be active (run create_demo_screenshots.sh first)
 * - Playwright must be installed: npm install -D @playwright/test
 * - MARCUS platform must be running in GKE
 *
 * Usage:
 *   npx tsx presentations/marcus_3.2_demo/capture_screenshots_auto.ts
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const GRAPHQL_URL = 'http://localhost:4001/graphql';
const GRAFANA_URL = 'http://localhost:5001';
const JAEGER_URL = 'http://34.123.164.214';

// GraphQL queries for demo
const VALID_CITATION_QUERY = `
mutation AnalyzeCitation {
  analyzeCitation(input: {
    claim: "GPT-4 achieved 86.4% accuracy on the MMLU benchmark",
    citation: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774"
  }) {
    id
    confidence
    consensus
    validity
    timestamp
  }
}
`;

const INVALID_CITATION_QUERY = `
mutation AnalyzeCitationDetailed {
  analyzeCitation(input: {
    claim: "LLMs can solve 97% of mathematical problems",
    citation: "Smith et al., Nature 2024"
  }) {
    id
    confidence
    consensus
    validity
    agents {
      name
      vote
      confidence
      reasoning
      processingTime
    }
  }
}
`;

async function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

async function captureGraphQLScreenshot(
  page: Page,
  query: string,
  filename: string
) {
  console.log(`\n📸 Capturing GraphQL: ${filename}...`);

  try {
    await page.goto(GRAPHQL_URL, { waitUntil: 'networkidle' });

    // Wait for GraphQL playground to load
    await page.waitForSelector('.graphiql-container', { timeout: 10000 });

    // Clear existing query and paste new one
    const queryEditor = page.locator('.query-editor textarea').first();
    await queryEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(query);

    // Execute query
    const executeButton = page.locator('button[aria-label="Execute query"]');
    await executeButton.click();

    // Wait for response
    await page.waitForTimeout(2000); // Give time for response

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`✅ Saved: ${screenshotPath}`);
  } catch (error) {
    console.error(`❌ Failed to capture ${filename}:`, error);
  }
}

async function captureGrafanaDashboard(
  page: Page,
  panelName: string,
  filename: string
) {
  console.log(`\n📸 Capturing Grafana panel: ${filename}...`);

  try {
    // Note: This is a placeholder - actual selectors depend on Grafana dashboard structure
    // You may need to customize these selectors based on your dashboard

    const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

    // For now, capture full page - you can refine to specific panels
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`✅ Saved: ${screenshotPath}`);
    console.log(`⚠️  Note: You may need to crop this to the specific panel`);
  } catch (error) {
    console.error(`❌ Failed to capture ${filename}:`, error);
  }
}

async function main() {
  console.log('🎬 MARCUS 3.2 Automated Screenshot Capture');
  console.log('==========================================\n');

  // Ensure screenshots directory exists
  await ensureDirectoryExists(SCREENSHOTS_DIR);

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser: Browser = await chromium.launch({
    headless: false, // Set to true for headless mode
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // 1. GraphQL Valid Citation
    await captureGraphQLScreenshot(
      page,
      VALID_CITATION_QUERY,
      'graphql_valid_citation.png'
    );

    // 2. GraphQL Invalid Citation
    await captureGraphQLScreenshot(
      page,
      INVALID_CITATION_QUERY,
      'graphql_invalid_citation.png'
    );

    // 3. Grafana Dashboards
    console.log(`\n📊 Navigating to Grafana: ${GRAFANA_URL}...`);
    await page.goto(GRAFANA_URL, { waitUntil: 'networkidle' });

    // Login to Grafana (if needed)
    const loginForm = page.locator('input[name="user"]');
    if (await loginForm.isVisible()) {
      console.log('🔐 Logging into Grafana...');
      await page.fill('input[name="user"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Skip password change if prompted
      const skipButton = page.locator('button:has-text("Skip")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
      }
    }

    // Navigate to MARCUS dashboard
    // Note: You'll need to customize this based on your actual dashboard
    console.log('📊 Looking for MARCUS dashboard...');

    // Capture dashboard screenshots
    // These are placeholders - you'll need to navigate to specific dashboards/panels
    await captureGrafanaDashboard(page, 'Throughput', 'grafana_throughput.png');

    // For other panels, you'd navigate to them and capture
    // This is a simplified version - you may want to add more specific navigation

    console.log('\n✨ Screenshot capture complete!');
    console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review screenshots for quality');
    console.log('2. Crop/edit as needed');
    console.log('3. Rename if necessary');
    console.log('4. Use in demo backup plan');

  } catch (error) {
    console.error('\n❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Check if port forwarding is active
async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');

  try {
    // Try to fetch from GraphQL endpoint
    const response = await fetch(GRAPHQL_URL);
    console.log('✅ GraphQL endpoint accessible');
  } catch (error) {
    console.error('❌ Cannot access GraphQL endpoint at', GRAPHQL_URL);
    console.error('   Please run ./create_demo_screenshots.sh first');
    process.exit(1);
  }

  try {
    // Try to fetch from Grafana endpoint
    const response = await fetch(GRAFANA_URL);
    console.log('✅ Grafana endpoint accessible');
  } catch (error) {
    console.error('❌ Cannot access Grafana at', GRAFANA_URL);
    console.error('   Please run ./create_demo_screenshots.sh first');
    process.exit(1);
  }

  console.log('');
}

// Run the script
checkPrerequisites().then(() => main()).catch(console.error);
