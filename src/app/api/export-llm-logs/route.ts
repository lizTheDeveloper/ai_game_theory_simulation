/**
 * API Route: Export LLM Logs to GCS
 *
 * POST /api/export-llm-logs
 *
 * Request body:
 * {
 *   simulationId: string;
 *   bucketName: string;
 *   projectId?: string;
 *   keyFilename?: string;
 *   credentials?: object;
 *   batchSize?: number;
 * }
 *
 * Response: Server-Sent Events (SSE) stream with progress updates
 *
 * Event format:
 * data: {"phase": "fetching", "current": 0, "total": 0, "message": "..."}
 * data: {"phase": "complete", "result": {...}}
 */

import { NextRequest } from 'next/server';
import { exportLLMLogsToGCS, type ExportConfig, type ExportResult } from '@/lib/gcsExport';

/**
 * Export LLM logs to GCS with streaming progress
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.simulationId) {
      return new Response(
        JSON.stringify({ error: 'simulationId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.bucketName) {
      return new Response(
        JSON.stringify({ error: 'bucketName is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build export config
    const config: ExportConfig = {
      bucketName: body.bucketName,
      projectId: body.projectId,
      keyFilename: body.keyFilename,
      credentials: body.credentials,
      batchSize: body.batchSize
    };

    // Create readable stream for Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Progress callback that sends SSE events
        const onProgress = (progress: any) => {
          const message = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Run export with progress streaming
          const result = await exportLLMLogsToGCS(
            body.simulationId,
            config,
            onProgress
          );

          // Send final result
          const finalMessage = `data: ${JSON.stringify({
            phase: 'result',
            result
          })}\n\n`;
          controller.enqueue(encoder.encode(finalMessage));

          // Close stream
          controller.close();

        } catch (error) {
          // Send error event
          const errorMessage = `data: ${JSON.stringify({
            phase: 'error',
            error: error instanceof Error ? error.message : String(error)
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      }
    });

    // Return SSE stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('[Export API] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET endpoint for health check / verification
 */
export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      service: 'LLM Log Export API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        POST: {
          description: 'Export LLM logs to Google Cloud Storage',
          requiredParams: ['simulationId', 'bucketName'],
          optionalParams: ['projectId', 'keyFilename', 'credentials', 'batchSize'],
          responseType: 'text/event-stream (Server-Sent Events)'
        }
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
