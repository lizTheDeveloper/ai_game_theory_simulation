/**
 * GCS Export Module
 *
 * Exports LLM inference logs from IndexedDB to Google Cloud Storage.
 *
 * Features:
 * - Batch export in JSONL format (one JSON object per line)
 * - Mark exported logs in IndexedDB to prevent duplicate exports
 * - Error handling with detailed error messages
 * - Progress reporting via callback
 * - Retry logic for transient failures
 *
 * Configuration:
 * - Requires GCS service account credentials (GOOGLE_APPLICATION_CREDENTIALS env var or explicit credentials)
 * - Bucket must exist and have write permissions
 * - Logs are exported to: gs://{bucket}/llm-logs/{simulationId}/{timestamp}.jsonl
 */

import { eventDatabase } from './eventDatabase';
import type { LLMInferenceLog } from '@/simulation/llm/logging';

// Type stubs for @google-cloud/storage (optional dependency)
type Storage = any;
type Bucket = any;
type File = any;

/**
 * Export configuration
 */
export interface ExportConfig {
  // GCS Configuration
  bucketName: string;
  projectId?: string;                 // GCP project ID (optional, can be inferred from credentials)
  keyFilename?: string;               // Path to service account JSON file (optional, uses GOOGLE_APPLICATION_CREDENTIALS if not provided)
  credentials?: object;               // Service account credentials object (alternative to keyFilename)

  // Export Options
  batchSize?: number;                 // Number of logs per export file (default: 1000)
  maxRetries?: number;                // Max retry attempts for failed uploads (default: 3)
  retryDelayMs?: number;              // Delay between retries in milliseconds (default: 1000)
}

/**
 * Progress callback for export operations
 */
export type ProgressCallback = (progress: {
  phase: 'fetching' | 'formatting' | 'uploading' | 'marking' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}) => void;

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  logsExported: number;
  gcsPath: string;
  bytesUploaded: number;
  durationMs: number;
  error?: string;
}

/**
 * Export LLM logs to Google Cloud Storage
 *
 * @param simulationId - Simulation run ID to export logs for
 * @param config - Export configuration (bucket, credentials, options)
 * @param onProgress - Optional progress callback
 * @returns Export result with success status and metadata
 */
export async function exportLLMLogsToGCS(
  simulationId: string,
  config: ExportConfig,
  onProgress?: ProgressCallback
): Promise<ExportResult> {
  const startTime = Date.now();

  // Validate inputs
  if (!simulationId) {
    throw new Error('❌ simulationId is required for GCS export');
  }
  if (!config.bucketName) {
    throw new Error('❌ bucketName is required for GCS export');
  }

  // Extract config with defaults
  const {
    bucketName,
    projectId,
    keyFilename,
    credentials,
    batchSize = 1000,
    maxRetries = 3,
    retryDelayMs = 1000
  } = config;

  try {
    // Phase 1: Fetch unexported logs from IndexedDB
    onProgress?.({
      phase: 'fetching',
      current: 0,
      total: 0,
      message: `Fetching unexported logs for simulation ${simulationId}...`
    });

    const logs = await eventDatabase.getUnexportedLLMLogs(batchSize);

    // Filter logs for this simulation
    const simulationLogs = logs.filter(log => log.simulationId === simulationId);

    if (simulationLogs.length === 0) {
      onProgress?.({
        phase: 'complete',
        current: 0,
        total: 0,
        message: 'No unexported logs found for this simulation'
      });

      return {
        success: true,
        logsExported: 0,
        gcsPath: '',
        bytesUploaded: 0,
        durationMs: Date.now() - startTime
      };
    }

    onProgress?.({
      phase: 'fetching',
      current: simulationLogs.length,
      total: simulationLogs.length,
      message: `Found ${simulationLogs.length} unexported logs`
    });

    // Phase 2: Format logs as JSONL (JSON Lines format - one object per line)
    onProgress?.({
      phase: 'formatting',
      current: 0,
      total: simulationLogs.length,
      message: 'Formatting logs as JSONL...'
    });

    const jsonlContent = simulationLogs
      .map((log, index) => {
        onProgress?.({
          phase: 'formatting',
          current: index + 1,
          total: simulationLogs.length,
          message: `Formatting log ${index + 1}/${simulationLogs.length}`
        });
        return JSON.stringify(log);
      })
      .join('\n');

    const bytesUploaded = Buffer.byteLength(jsonlContent, 'utf8');

    // Phase 3: Upload to GCS
    onProgress?.({
      phase: 'uploading',
      current: 0,
      total: 1,
      message: 'Uploading to Google Cloud Storage...'
    });

    // Initialize GCS client (dynamic import for optional dependency)
    let StorageClass: any;
    try {
      const gcsModule = await import('@google-cloud/storage' as any);
      StorageClass = gcsModule.Storage;
    } catch (error) {
      throw new Error('❌ @google-cloud/storage package not installed. Install with: npm install @google-cloud/storage');
    }

    const storageOptions: any = {};
    if (projectId) storageOptions.projectId = projectId;
    if (keyFilename) storageOptions.keyFilename = keyFilename;
    if (credentials) storageOptions.credentials = credentials;

    const storage = new StorageClass(storageOptions);
    const bucket = storage.bucket(bucketName);

    // Generate GCS path: llm-logs/{simulationId}/{timestamp}.jsonl
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const gcsPath = `llm-logs/${simulationId}/${timestamp}.jsonl`;

    // Upload with retry logic
    let uploadSuccess = false;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        onProgress?.({
          phase: 'uploading',
          current: attempt,
          total: maxRetries,
          message: `Upload attempt ${attempt}/${maxRetries}...`
        });

        const file = bucket.file(gcsPath);
        await file.save(jsonlContent, {
          contentType: 'application/x-ndjson',
          metadata: {
            simulationId,
            logsCount: simulationLogs.length.toString(),
            exportTimestamp: new Date().toISOString()
          }
        });

        uploadSuccess = true;
        break;
      } catch (error) {
        lastError = error as Error;
        console.error(`[GCS Export] Upload attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt));
        }
      }
    }

    if (!uploadSuccess) {
      throw new Error(`❌ Failed to upload to GCS after ${maxRetries} attempts: ${lastError?.message}`);
    }

    // Phase 4: Mark logs as exported in IndexedDB
    onProgress?.({
      phase: 'marking',
      current: 0,
      total: simulationLogs.length,
      message: 'Marking logs as exported in IndexedDB...'
    });

    const logIds = simulationLogs.map(log => log.id);
    await eventDatabase.markLLMLogsAsExported(logIds, gcsPath);

    onProgress?.({
      phase: 'marking',
      current: simulationLogs.length,
      total: simulationLogs.length,
      message: `Marked ${simulationLogs.length} logs as exported`
    });

    // Complete
    const durationMs = Date.now() - startTime;

    onProgress?.({
      phase: 'complete',
      current: simulationLogs.length,
      total: simulationLogs.length,
      message: `✅ Exported ${simulationLogs.length} logs to gs://${bucketName}/${gcsPath} (${(bytesUploaded / 1024).toFixed(2)} KB in ${durationMs}ms)`
    });

    return {
      success: true,
      logsExported: simulationLogs.length,
      gcsPath: `gs://${bucketName}/${gcsPath}`,
      bytesUploaded,
      durationMs
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    onProgress?.({
      phase: 'error',
      current: 0,
      total: 0,
      message: `❌ Export failed: ${errorMessage}`
    });

    return {
      success: false,
      logsExported: 0,
      gcsPath: '',
      bytesUploaded: 0,
      durationMs: Date.now() - startTime,
      error: errorMessage
    };
  }
}

/**
 * Verify GCS bucket exists and is writable
 *
 * @param config - Export configuration with bucket and credentials
 * @returns True if bucket exists and is writable, false otherwise
 */
export async function verifyGCSAccess(config: ExportConfig): Promise<{
  accessible: boolean;
  error?: string;
}> {
  try {
    const { bucketName, projectId, keyFilename, credentials } = config;

    // Initialize GCS client (dynamic import for optional dependency)
    let StorageClass: any;
    try {
      const gcsModule = await import('@google-cloud/storage' as any);
      StorageClass = gcsModule.Storage;
    } catch (error) {
      return {
        accessible: false,
        error: '@google-cloud/storage package not installed. Install with: npm install @google-cloud/storage'
      };
    }

    const storageOptions: any = {};
    if (projectId) storageOptions.projectId = projectId;
    if (keyFilename) storageOptions.keyFilename = keyFilename;
    if (credentials) storageOptions.credentials = credentials;

    const storage = new StorageClass(storageOptions);
    const bucket = storage.bucket(bucketName);

    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      return {
        accessible: false,
        error: `Bucket '${bucketName}' does not exist`
      };
    }

    // Test write access by creating a temporary file
    const testFile = bucket.file(`llm-logs/.test-${Date.now()}.txt`);
    await testFile.save('test', { contentType: 'text/plain' });
    await testFile.delete();

    return { accessible: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      accessible: false,
      error: `GCS access verification failed: ${errorMessage}`
    };
  }
}
