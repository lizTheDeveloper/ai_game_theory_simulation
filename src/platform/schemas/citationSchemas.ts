/**
 * MARCUS 3.0 Citation Integrity Platform
 * Citation Analysis Validation Schemas
 *
 * Zod schemas for citation analysis endpoints
 *
 * @module citationSchemas
 * @author Marcus (Platform Engineer)
 */

import { z } from 'zod';
import {
  citationTextSchema,
  sanitizedStringSchema,
  uuidSchema,
} from '../middleware/validation';

// ============================================================================
// Citation Analysis Schemas
// ============================================================================

/**
 * POST /api/citations/analyze
 */
export const analyzeCitationSchema = z.object({
  text: citationTextSchema,
  claimedSource: sanitizedStringSchema(1, 1000),
  metadata: z
    .object({
      documentId: uuidSchema.optional(),
      documentTitle: sanitizedStringSchema(1, 500).optional(),
      author: sanitizedStringSchema(1, 200).optional(),
      year: z
        .number()
        .int('Year must be an integer')
        .min(1900, 'Year must be 1900 or later')
        .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
        .optional(),
      tags: z
        .array(sanitizedStringSchema(1, 50))
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
    })
    .optional(),
});

export type AnalyzeCitationInput = z.infer<typeof analyzeCitationSchema>;
