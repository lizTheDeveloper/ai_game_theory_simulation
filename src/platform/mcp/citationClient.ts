/**
 * MCP Citation Verification Client
 *
 * Client for citation-verifier agent MCP server.
 *
 * Methods:
 * - verifyCitation(claim, citation): Verify single citation
 * - batchVerify(claims[]): Verify multiple citations
 * - getVerificationStatus(citationId): Check verification status
 *
 * Integration:
 * - Connects to citation-verifier MCP server (research-pdfs tool)
 * - Uses semantic search to validate claims against papers
 * - Returns verification results with confidence scores
 *
 * Usage:
 * ```typescript
 * const client = new CitationClient({
 *   serverUrl: 'http://localhost:3000/mcp'
 * });
 *
 * const result = await client.verifyCitation(
 *   'Li et al. (2023) reports 2.0 million L/training',
 *   { doi: '10.1234/test', authors: ['Li'], year: 2023 }
 * );
 * ```
 *
 * Task: 2.1.1 (Phase 1 Week 2)
 */

import { assertDefined } from '@/simulation/utils/assertions';

/**
 * Citation metadata
 */
export interface Citation {
  /**
   * DOI (if available)
   */
  doi?: string;

  /**
   * Authors
   */
  authors: string[];

  /**
   * Publication year
   */
  year: number;

  /**
   * Title
   */
  title?: string;

  /**
   * Journal/venue
   */
  venue?: string;

  /**
   * Page number (if specific)
   */
  page?: number;
}

/**
 * Verification result
 */
export interface VerificationResult {
  /**
   * Verified?
   */
  verified: boolean;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Verification method
   */
  method: 'exact_match' | 'semantic_match' | 'paraphrase_match' | 'not_found';

  /**
   * Matching excerpt from paper (if found)
   */
  excerpt?: string;

  /**
   * Page number where found (if available)
   */
  page?: number;

  /**
   * Similarity score (if semantic match)
   */
  similarity?: number;

  /**
   * Error message (if verification failed)
   */
  error?: string;

  /**
   * Timestamp
   */
  timestamp: number;
}

/**
 * Batch verification request
 */
export interface BatchVerificationRequest {
  /**
   * Claim text
   */
  claim: string;

  /**
   * Citation metadata
   */
  citation: Citation;

  /**
   * Request ID (for tracking)
   */
  id: string;
}

/**
 * Batch verification result
 */
export interface BatchVerificationResult {
  /**
   * Request ID
   */
  id: string;

  /**
   * Verification result
   */
  result: VerificationResult;

  /**
   * Processing time (ms)
   */
  processingTime: number;
}

/**
 * Citation client configuration
 */
export interface CitationClientConfig {
  /**
   * MCP server URL (or connection config)
   * For now, we'll support both URL-based and subprocess-based
   */
  serverUrl?: string;

  /**
   * Subprocess command (if using subprocess)
   */
  subprocessCommand?: string;

  /**
   * Connection timeout (ms)
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Retry attempts on failure
   * Default: 2
   */
  retries?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * MCP Citation Client
 *
 * Client for citation-verifier MCP server.
 */
export class CitationClient {
  private config: Required<CitationClientConfig>;
  private verificationCount: number;
  private connected: boolean;

  constructor(config: CitationClientConfig) {
    // At least one connection method must be provided
    if (!config.serverUrl && !config.subprocessCommand) {
      throw new Error(
        '❌ CRITICAL: Either serverUrl or subprocessCommand must be provided'
      );
    }

    this.config = {
      serverUrl: config.serverUrl ?? '',
      subprocessCommand: config.subprocessCommand ?? '',
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 2,
      enableLogging: config.enableLogging ?? false,
    };

    this.verificationCount = 0;
    this.connected = false;
  }

  /**
   * Connect to MCP server
   *
   * @returns True if connected
   */
  public async connect(): Promise<boolean> {
    if (this.connected) {
      return true;
    }

    try {
      // For URL-based connection, verify server is reachable
      if (this.config.serverUrl) {
        // TODO: Implement actual HTTP health check
        // For now, just mark as connected
        this.connected = true;

        if (this.config.enableLogging) {
          console.log(
            `✅ CitationClient: Connected to ${this.config.serverUrl}`
          );
        }
      }
      // For subprocess-based, we'll spawn on first use
      else if (this.config.subprocessCommand) {
        this.connected = true;

        if (this.config.enableLogging) {
          console.log(
            `✅ CitationClient: Subprocess mode (${this.config.subprocessCommand})`
          );
        }
      }

      return true;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ CitationClient: Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      return false;
    }
  }

  /**
   * Verify a single citation
   *
   * @param claim - Claim text to verify
   * @param citation - Citation metadata
   * @returns Verification result
   */
  public async verifyCitation(
    claim: string,
    citation: Citation
  ): Promise<VerificationResult> {
    assertDefined(claim, {
      location: 'CitationClient.verifyCitation',
      valueName: 'claim',
    });

    assertDefined(citation, {
      location: 'CitationClient.verifyCitation',
      valueName: 'citation',
    });

    if (!this.connected) {
      const connected = await this.connect();
      if (!connected) {
        return {
          verified: false,
          confidence: 0,
          method: 'not_found',
          error: 'Not connected to MCP server',
          timestamp: Date.now(),
        };
      }
    }

    this.verificationCount++;

    try {
      // Build search query from claim and citation
      const query = this.buildSearchQuery(claim, citation);

      // Call MCP server (or subprocess)
      const result = await this.callMCPServer(query, citation);

      if (this.config.enableLogging) {
        console.log(
          `✅ CitationClient: Verified "${claim.substring(0, 50)}..." → ${result.verified}`
        );
      }

      return result;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(
          `❌ CitationClient: Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return {
        verified: false,
        confidence: 0,
        method: 'not_found',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Batch verify multiple citations
   *
   * @param requests - Array of verification requests
   * @returns Array of verification results
   */
  public async batchVerify(
    requests: BatchVerificationRequest[]
  ): Promise<BatchVerificationResult[]> {
    assertDefined(requests, {
      location: 'CitationClient.batchVerify',
      valueName: 'requests',
    });

    if (!this.connected) {
      await this.connect();
    }

    const results: BatchVerificationResult[] = [];

    // Process in parallel with concurrency limit
    const concurrency = 5; // Max 5 concurrent requests
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);

      const batchResults = await Promise.all(
        batch.map(async (req) => {
          const startTime = Date.now();

          const result = await this.verifyCitation(req.claim, req.citation);

          return {
            id: req.id,
            result,
            processingTime: Date.now() - startTime,
          };
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get verification status for a citation
   * (For async verification queue integration)
   *
   * @param citationId - Citation ID
   * @returns Verification result if available
   */
  public async getVerificationStatus(
    citationId: string
  ): Promise<VerificationResult | null> {
    // TODO: Implement status tracking (requires backend support)
    // For now, return null (not implemented)
    return null;
  }

  /**
   * Build search query from claim and citation
   *
   * @param claim - Claim text
   * @param citation - Citation metadata
   * @returns Search query
   */
  private buildSearchQuery(claim: string, citation: Citation): string {
    // Extract key terms from claim
    let query = claim;

    // Add author constraint if available
    if (citation.authors.length > 0) {
      const firstAuthor = citation.authors[0];
      query = `${firstAuthor} ${claim}`;
    }

    // Add year constraint
    query = `${query} ${citation.year}`;

    return query;
  }

  /**
   * Call MCP server to verify citation
   *
   * @param query - Search query
   * @param citation - Citation metadata
   * @returns Verification result
   */
  private async callMCPServer(
    query: string,
    citation: Citation
  ): Promise<VerificationResult> {
    // TODO: Implement actual MCP server call
    // This is a stub implementation for now

    // For URL-based connection
    if (this.config.serverUrl) {
      // Would use fetch/axios here
      // For now, return mock result
      return {
        verified: false,
        confidence: 0,
        method: 'not_found',
        error: 'MCP server integration not yet implemented',
        timestamp: Date.now(),
      };
    }

    // For subprocess-based connection
    if (this.config.subprocessCommand) {
      // Would spawn subprocess here
      // For now, return mock result
      return {
        verified: false,
        confidence: 0,
        method: 'not_found',
        error: 'Subprocess integration not yet implemented',
        timestamp: Date.now(),
      };
    }

    throw new Error('No connection method available');
  }

  /**
   * Disconnect from MCP server
   */
  public async disconnect(): Promise<void> {
    this.connected = false;

    if (this.config.enableLogging) {
      console.log('✅ CitationClient: Disconnected');
    }
  }

  /**
   * Get client statistics
   *
   * @returns Stats object
   */
  public getStats(): {
    verificationCount: number;
    connected: boolean;
  } {
    return {
      verificationCount: this.verificationCount,
      connected: this.connected,
    };
  }
}

/**
 * Create citation client
 *
 * @param config - Client configuration
 * @returns CitationClient instance
 */
export function createCitationClient(
  config: CitationClientConfig
): CitationClient {
  return new CitationClient(config);
}
