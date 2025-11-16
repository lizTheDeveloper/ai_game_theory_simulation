/**
 * API Type Definitions
 *
 * Shared types for REST and GraphQL APIs
 */

import { z } from 'zod';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Only in development
}

/**
 * API Metadata (pagination, timing, etc.)
 */
export interface ApiMetadata {
  timestamp: number;
  requestId: string;
  version: string;
  pagination?: PaginationMetadata;
  performance?: PerformanceMetadata;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Performance metadata
 */
export interface PerformanceMetadata {
  duration: number; // ms
  cached: boolean;
  cacheHitRate?: number;
}

/**
 * Authentication payload (JWT)
 */
export interface AuthPayload {
  userId: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/**
 * User roles (RBAC)
 */
export type UserRole = 'admin' | 'researcher' | 'read-only';

/**
 * Provenance validation request
 */
export const ProvenanceValidationRequestSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  type: z.enum(['PLACEHOLDER', 'INFORMED', 'VERIFIED']).optional(),
  source: z.string().optional(),
  doi: z.string().optional(),
});

export type ProvenanceValidationRequest = z.infer<typeof ProvenanceValidationRequestSchema>;

/**
 * Provenance validation response
 */
export interface ProvenanceValidationResponse {
  validated: boolean;
  updatedValue?: number | string;
  provenance: {
    type: 'PLACEHOLDER' | 'INFORMED' | 'VERIFIED';
    source?: string;
    doi?: string;
    confidence: number;
    lss: number;
    sensitivity?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  warnings?: string[];
}

/**
 * Claim extraction request
 */
export const ClaimExtractionRequestSchema = z.object({
  content: z.string().min(1),
  format: z.enum(['markdown', 'plain']).default('markdown'),
});

export type ClaimExtractionRequest = z.infer<typeof ClaimExtractionRequestSchema>;

/**
 * Claim structure
 */
export interface Claim {
  id: string;
  text: string;
  sourceRef: string;
  extractedValue?: string | number;
  file?: string;
  line?: number;
  timestamp: number;
}

/**
 * Claim verification request
 */
export const ClaimVerificationRequestSchema = z.object({
  claims: z.array(z.object({
    id: z.string(),
    text: z.string(),
    sourceRef: z.string(),
    extractedValue: z.union([z.string(), z.number()]).optional(),
  })),
  timeout: z.number().min(1000).max(30000).default(10000), // ms
});

export type ClaimVerificationRequest = z.infer<typeof ClaimVerificationRequestSchema>;

/**
 * Claim verification result
 */
export interface ClaimVerificationResult {
  id: string;
  verified: boolean;
  confidence: number;
  sourceMatch?: string;
  lss: number;
  severity?: 'VERIFIED' | 'MAGNITUDE_ERROR' | 'SCOPE_INFLATION' | 'FABRICATION';
  penalty?: number;
}

/**
 * Grading request
 */
export const GradingRequestSchema = z.object({
  studentId: z.string(),
  assignmentId: z.string(),
  claims: z.array(z.object({
    id: z.string(),
    text: z.string(),
    sourceRef: z.string(),
  })),
  rubric: z.object({
    maxPoints: z.number(),
    severityWeights: z.object({
      VERIFIED: z.number(),
      MAGNITUDE_ERROR: z.number(),
      SCOPE_INFLATION: z.number(),
      FABRICATION: z.number(),
    }),
  }).optional(),
});

export type GradingRequest = z.infer<typeof GradingRequestSchema>;

/**
 * Grading response
 */
export interface GradingResponse {
  studentId: string;
  assignmentId: string;
  totalClaims: number;
  verifiedClaims: number;
  errors: {
    magnitude: number;
    scope: number;
    fabrication: number;
  };
  score: number;
  maxScore: number;
  grade: string;
  feedback: string[];
  details: ClaimVerificationResult[];
}

/**
 * LSS monitoring request
 */
export const LssMonitoringRequestSchema = z.object({
  level: z.enum(['parameter', 'claim', 'memory', 'verification']),
  threshold: z.number().min(0).max(1).default(0.2),
  since: z.number().optional(), // timestamp
  limit: z.number().min(1).max(1000).default(100),
});

export type LssMonitoringRequest = z.infer<typeof LssMonitoringRequestSchema>;

/**
 * LSS event
 */
export interface LssEvent {
  id: string;
  level: 'parameter' | 'claim' | 'memory' | 'verification';
  lss: number;
  threshold: number;
  context: string;
  details: Record<string, unknown>;
  timestamp: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    cache: ServiceHealth;
    queue: ServiceHealth;
    mcp: ServiceHealth;
  };
}

/**
 * Service health status
 */
export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number; // ms
  error?: string;
}
