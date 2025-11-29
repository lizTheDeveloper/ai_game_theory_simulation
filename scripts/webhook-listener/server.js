#!/usr/bin/env node
/**
 * SATU Webhook Listener
 * Receives GitHub webhooks, validates signatures, triggers deployments
 */

const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 8080;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/home/user/satu/deployment/deploy-vm-blue-green.sh';
const LOG_FILE = process.env.LOG_FILE || '/var/log/satu-webhook.log';

if (!WEBHOOK_SECRET) {
    console.error('❌ ERROR: WEBHOOK_SECRET environment variable not set');
    process.exit(1);
}

if (!fs.existsSync(DEPLOY_SCRIPT)) {
    console.error(`❌ ERROR: Deploy script not found: ${DEPLOY_SCRIPT}`);
    process.exit(1);
}

/**
 * Verify GitHub webhook signature (HMAC-SHA256)
 */
function verifySignature(payload, signature) {
    if (!signature) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(digest)
        );
    } catch (error) {
        return false;
    }
}

/**
 * Log message to file and console
 */
function log(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;

    console.log(logLine.trim());

    try {
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
        console.error('Failed to write to log file:', error.message);
    }
}

/**
 * Execute deployment script
 */
function executeDeploy() {
    log('🚀 Executing deployment script...');

    try {
        const output = execSync(DEPLOY_SCRIPT, {
            encoding: 'utf8',
            timeout: 600000,  // 10 minute timeout
            stdio: 'pipe'
        });

        log('✅ Deployment completed successfully');
        log('Deployment output:\n' + output);

        return { success: true, output };
    } catch (error) {
        log('❌ Deployment failed: ' + error.message);
        log('Deployment stderr:\n' + (error.stderr || 'No stderr output'));

        return { success: false, error: error.message };
    }
}

/**
 * HTTP request handler
 */
const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'satu-webhook-listener',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Webhook endpoint
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Verify signature
                const signature = req.headers['x-hub-signature-256'];
                if (!verifySignature(body, signature)) {
                    log('⚠️ Invalid webhook signature');
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid signature' }));
                    return;
                }

                // Parse payload
                const payload = JSON.parse(body);
                const event = req.headers['x-github-event'];

                log(`📬 Received webhook: ${event}`);

                // Only handle push events
                if (event !== 'push') {
                    log(`ℹ️ Ignoring ${event} event`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: `Ignoring ${event} event` }));
                    return;
                }

                // Check if push is to production branch
                if (payload.ref !== 'refs/heads/production') {
                    log(`ℹ️ Push to ${payload.ref}, not production branch - ignoring`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Not production branch, ignoring' }));
                    return;
                }

                log('✅ Production branch push detected');
                log(`   Commits: ${payload.commits?.length || 0}`);
                log(`   Pusher: ${payload.pusher?.name || 'unknown'}`);

                // Execute deployment (async, send response immediately)
                res.writeHead(202, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Deployment triggered',
                    branch: 'production'
                }));

                // Deploy in background (don't wait for completion)
                setImmediate(() => {
                    executeDeploy();
                });

            } catch (error) {
                log('❌ Webhook processing error: ' + error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });

        return;
    }

    // 404 for all other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    log(`🎧 Webhook listener started on port ${PORT}`);
    log(`   Deploy script: ${DEPLOY_SCRIPT}`);
    log(`   Log file: ${LOG_FILE}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    log('⏹️ SIGTERM received, shutting down gracefully');
    server.close(() => {
        log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('⏹️ SIGINT received, shutting down gracefully');
    server.close(() => {
        log('✅ Server closed');
        process.exit(0);
    });
});
