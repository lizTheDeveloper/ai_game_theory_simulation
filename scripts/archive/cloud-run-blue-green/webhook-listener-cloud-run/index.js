#!/usr/bin/env node
/**
 * GitHub Webhook Listener for Blue-Green Deployment
 *
 * Receives webhook from GitHub on push to production branch.
 * Triggers blue-green deployment to Cloud Run.
 *
 * Security: Validates GitHub webhook signature (HMAC SHA-256).
 *
 * Devon - "If your webhook doesn't validate signatures, you deserve to get hacked."
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const PORT = process.env.PORT || 8080;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'multiverseschool';
const REGION = process.env.GCP_REGION || 'europe-west1';
const REPO_URL = process.env.REPO_URL || 'https://github.com/supercyberal/SuperalignmentToUtopia.git';

// Service names
const BLUE_SERVICE = 'satu-blue';
const GREEN_SERVICE = 'satu-green';

/**
 * Validate GitHub webhook signature
 * Prevents random internet people from triggering deployments
 */
function validateSignature(payload, signature) {
  if (!WEBHOOK_SECRET) {
    console.error('❌ CRITICAL: GITHUB_WEBHOOK_SECRET not set');
    return false;
  }

  if (!signature) {
    console.error('❌ No signature provided');
    return false;
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  const sigBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);

  // Constant-time comparison (prevents timing attacks)
  if (sigBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, digestBuffer);
}

/**
 * Get current LIVE service (blue or green)
 */
async function getCurrentLiveService() {
  try {
    // Check which service has the "LIVE" tag on its latest revision
    const blueCmd = `gcloud run services describe ${BLUE_SERVICE} --region ${REGION} --format="value(status.traffic[0].tag)" 2>/dev/null`;
    const greenCmd = `gcloud run services describe ${GREEN_SERVICE} --region ${REGION} --format="value(status.traffic[0].tag)" 2>/dev/null`;

    const [blueResult, greenResult] = await Promise.all([
      execPromise(blueCmd).catch(() => ({ stdout: '' })),
      execPromise(greenCmd).catch(() => ({ stdout: '' }))
    ]);

    const blueTag = blueResult.stdout.trim();
    const greenTag = greenResult.stdout.trim();

    if (blueTag === 'LIVE') return BLUE_SERVICE;
    if (greenTag === 'LIVE') return GREEN_SERVICE;

    // Default to blue if neither has LIVE tag (initial setup)
    console.log('⚠️ No LIVE tag found, defaulting to BLUE as current');
    return BLUE_SERVICE;
  } catch (error) {
    console.error('❌ Error checking live service:', error.message);
    throw error;
  }
}

/**
 * Deploy to target service
 */
async function deployToService(serviceName, commitSha) {
  console.log(`\n🚀 Deploying to ${serviceName} (commit ${commitSha.substring(0, 7)})...`);

  const deployCmd = `
    # Clone repo to temp dir
    TMPDIR=$(mktemp -d)
    cd $TMPDIR
    git clone ${REPO_URL} .
    git checkout ${commitSha}

    # Deploy to Cloud Run
    gcloud run deploy ${serviceName} \
      --source . \
      --region ${REGION} \
      --allow-unauthenticated \
      --memory 2Gi \
      --cpu 1 \
      --max-instances 10 \
      --min-instances 0 \
      --port 3333 \
      --timeout 300 \
      --no-traffic \
      --tag staging

    # Cleanup
    cd /
    rm -rf $TMPDIR
  `;

  try {
    const { stdout, stderr } = await execPromise(deployCmd, {
      maxBuffer: 10 * 1024 * 1024,  // 10MB buffer for logs
      timeout: 600000  // 10 minute timeout
    });
    console.log('✅ Deployment output:', stdout);
    if (stderr) console.error('⚠️ Stderr:', stderr);
    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

/**
 * Run health check on service
 */
async function healthCheck(serviceName) {
  console.log(`\n🏥 Running health check on ${serviceName}...`);

  try {
    // Get service URL
    const urlCmd = `gcloud run services describe ${serviceName} --region ${REGION} --format="value(status.url)"`;
    const { stdout } = await execPromise(urlCmd);
    const serviceUrl = stdout.trim();

    // Test health endpoint (just check it loads)
    const curlCmd = `curl -f -s -o /dev/null -w "%{http_code}" ${serviceUrl}/ --max-time 30`;
    const { stdout: statusCode } = await execPromise(curlCmd);

    if (statusCode.trim() === '200') {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.error(`❌ Health check failed: HTTP ${statusCode}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Switch LIVE traffic to target service
 */
async function switchTraffic(targetService) {
  console.log(`\n🔄 Switching LIVE traffic to ${targetService}...`);

  const oldService = targetService === BLUE_SERVICE ? GREEN_SERVICE : BLUE_SERVICE;

  try {
    // Remove LIVE tag from old service
    await execPromise(`
      gcloud run services update-traffic ${oldService} \
        --region ${REGION} \
        --remove-tags LIVE
    `).catch(() => {
      // Ignore errors (tag might not exist)
    });

    // Add LIVE tag to new service (100% traffic)
    await execPromise(`
      gcloud run services update-traffic ${targetService} \
        --region ${REGION} \
        --to-latest \
        --tag LIVE
    `);

    console.log('✅ Traffic switched successfully');
    return true;
  } catch (error) {
    console.error('❌ Traffic switch failed:', error.message);
    throw error;
  }
}

/**
 * Main deployment orchestration
 */
async function handleDeployment(commitSha, branch) {
  console.log('\n========================================');
  console.log('🚀 BLUE-GREEN DEPLOYMENT STARTED');
  console.log('========================================');
  console.log(`Branch: ${branch}`);
  console.log(`Commit: ${commitSha}`);
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    // 1. Determine current LIVE service
    const currentLive = await getCurrentLiveService();
    const targetService = currentLive === BLUE_SERVICE ? GREEN_SERVICE : BLUE_SERVICE;

    console.log(`\n📊 Current LIVE: ${currentLive}`);
    console.log(`📊 Deploying to: ${targetService}`);

    // 2. Deploy to standby service
    await deployToService(targetService, commitSha);

    // 3. Health check
    const healthy = await healthCheck(targetService);
    if (!healthy) {
      throw new Error('Health check failed - aborting deployment');
    }

    // 4. Switch traffic
    await switchTraffic(targetService);

    console.log('\n========================================');
    console.log('✅ DEPLOYMENT SUCCESSFUL');
    console.log('========================================');
    console.log(`LIVE service: ${targetService}`);
    console.log(`Standby service: ${currentLive}`);
    console.log('\n💡 To rollback, run:');
    console.log(`   ./webhook-listener/rollback.sh ${currentLive}`);
    console.log('========================================\n');

    return { success: true, liveService: targetService };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ DEPLOYMENT FAILED');
    console.error('========================================');
    console.error(error.message);
    console.error('========================================\n');

    return { success: false, error: error.message };
  }
}

/**
 * HTTP request handler
 */
async function handleRequest(req, res) {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Webhook endpoint
  if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        // Validate signature
        const signature = req.headers['x-hub-signature-256'];
        if (!validateSignature(body, signature)) {
          console.error('❌ Invalid webhook signature');
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Unauthorized');
          return;
        }

        const payload = JSON.parse(body);
        const event = req.headers['x-github-event'];

        console.log(`\n📨 Received ${event} event`);

        // Only deploy on push to production branch
        if (event === 'push' && payload.ref === 'refs/heads/production') {
          const commitSha = payload.after;
          const branch = payload.ref.replace('refs/heads/', '');

          console.log('✅ Valid production push detected');

          // Respond immediately (don't wait for deployment)
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'deployment started' }));

          // Start deployment asynchronously
          handleDeployment(commitSha, branch).then(result => {
            console.log('Deployment completed:', result);
          });
        } else {
          console.log(`⏭️  Ignoring ${event} on ${payload.ref}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ignored' }));
        }
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });

    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

/**
 * Start server
 */
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🎯 Webhook Listener Started');
  console.log('========================================');
  console.log(`Port: ${PORT}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Region: ${REGION}`);
  console.log(`Services: ${BLUE_SERVICE}, ${GREEN_SERVICE}`);
  console.log('========================================\n');

  if (!WEBHOOK_SECRET) {
    console.error('⚠️  WARNING: GITHUB_WEBHOOK_SECRET not set!');
    console.error('⚠️  Webhook signature validation disabled!');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
