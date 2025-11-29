/**
 * Health check endpoint for blue-green deployment
 * Used by deployment scripts to validate service is running
 */

export async function GET() {
    return Response.json({
        status: 'ok',
        service: process.env.SERVICE_NAME || 'unknown',
        port: process.env.PORT || '3333',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
}
