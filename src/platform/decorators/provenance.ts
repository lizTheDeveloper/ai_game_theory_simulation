/**
 * @provenance Decorator for Parameter Tracking
 *
 * Captures parameter metadata at definition time for the Citation Integrity Platform.
 * Integrates with Nested Learning multi-level optimization (PLACEHOLDER → INFORMED → VERIFIED).
 *
 * Usage:
 *   const CO2_BASELINE = provenance(280, {
 *     provenance: createVerified(
 *       '10.1038/nature12121',
 *       'IPCC (2013). Climate Change 2013',
 *       280,
 *       0.95
 *     ),
 *     tags: ['climate', 'baseline'],
 *   });
 *
 * Or with PLACEHOLDER:
 *   const TEMP_VALUE = provenance(50, {
 *     provenance: createPlaceholder(0.3, 'Temporary value for testing'),
 *     tags: ['temporary'],
 *   });
 */

import type {
  Provenance,
  ProvenanceDecoratorOptions,
  ParameterProvenance,
  ProvenanceValidationResult,
  SensitivityLevel,
} from '@/types/provenance';
import { validateProvenance } from '@/types/provenance';

/**
 * Global provenance registry
 *
 * Stores all parameters marked with @provenance decorator.
 * Used by linter, CLI tools, and monitoring systems.
 */
export class ProvenanceRegistry {
  private static instance: ProvenanceRegistry;
  private registry: Map<string, ParameterProvenance> = new Map();

  private constructor() {}

  static getInstance(): ProvenanceRegistry {
    if (!ProvenanceRegistry.instance) {
      ProvenanceRegistry.instance = new ProvenanceRegistry();
    }
    return ProvenanceRegistry.instance;
  }

  /**
   * Register a parameter with provenance metadata
   */
  register(param: ParameterProvenance): void {
    this.registry.set(param.name, param);
  }

  /**
   * Get provenance for a parameter
   */
  get(name: string): ParameterProvenance | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all registered parameters
   */
  getAll(): ParameterProvenance[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get parameters by provenance level
   */
  getByLevel(level: 'PLACEHOLDER' | 'INFORMED' | 'VERIFIED'): ParameterProvenance[] {
    return this.getAll().filter((p) => p.provenance.type === level);
  }

  /**
   * Get parameters needing validation
   */
  getNeedsValidation(): ParameterProvenance[] {
    return this.getAll().filter((p) => {
      if (p.provenance.type === 'PLACEHOLDER') {
        return p.provenance.needs_validation;
      }
      return false;
    });
  }

  /**
   * Get parameters by sensitivity level
   */
  getBySensitivity(level: SensitivityLevel): ParameterProvenance[] {
    return this.getAll().filter((p) => p.sensitivity?.level === level);
  }

  /**
   * Check if a parameter exists
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Get total count of registered parameters
   */
  count(): number {
    return this.registry.size;
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Export registry to JSON
   */
  export(): Record<string, ParameterProvenance> {
    const result: Record<string, ParameterProvenance> = {};
    this.registry.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Import registry from JSON
   */
  import(data: Record<string, ParameterProvenance>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.registry.set(key, value);
    });
  }
}

/**
 * Provenance decorator options with auto-naming
 */
interface ProvenanceOptions extends ProvenanceDecoratorOptions {
  /** Auto-generated parameter name (from call site) */
  name?: string;
  /** Units for the parameter */
  units?: string;
}

/**
 * Main provenance decorator function
 *
 * Marks a numeric constant with provenance metadata and registers it in the global registry.
 *
 * @param value - The parameter value
 * @param options - Provenance metadata and options
 * @returns The original value (pass-through)
 *
 * @example
 * // VERIFIED provenance
 * const CO2_BASELINE = provenance(280, {
 *   name: 'CO2_BASELINE',
 *   units: 'ppm',
 *   provenance: createVerified(
 *     '10.1038/nature12121',
 *     'IPCC (2013). Climate Change 2013: The Physical Science Basis',
 *     280,
 *     0.95
 *   ),
 *   tags: ['climate', 'baseline'],
 * });
 *
 * @example
 * // PLACEHOLDER provenance
 * const TEMP_THRESHOLD = provenance(50, {
 *   name: 'TEMP_THRESHOLD',
 *   provenance: createPlaceholder(0.3, 'Needs research - currently engineering guess'),
 *   tags: ['temporary', 'needs-validation'],
 * });
 *
 * @example
 * // INFORMED provenance
 * const GROWTH_RATE = provenance(0.03, {
 *   name: 'GROWTH_RATE',
 *   units: 'per year',
 *   provenance: createInformed(
 *     0.7,
 *     'Extrapolated from World Bank data 2010-2020',
 *     ['https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG']
 *   ),
 *   tags: ['economic', 'growth'],
 * });
 */
export function provenance<T extends number>(value: T, options: ProvenanceOptions): T {
  // Validate provenance metadata
  const validationResult: ProvenanceValidationResult = validateProvenance(options.provenance);

  if (!validationResult.valid) {
    const errors = validationResult.errors.join(', ');
    throw new Error(
      `❌ PROVENANCE ERROR: Invalid provenance metadata for parameter '${options.name || 'unknown'}': ${errors}`
    );
  }

  // Warn on validation warnings (don't throw)
  if (validationResult.warnings.length > 0) {
    console.warn(
      `⚠️ PROVENANCE WARNING: Parameter '${options.name || 'unknown'}': ${validationResult.warnings.join(', ')}`
    );
  }

  // Auto-generate name if not provided (fallback to 'unnamed_N')
  const paramName = options.name || `unnamed_${Date.now()}`;

  // Create ParameterProvenance entry
  const paramProvenance: ParameterProvenance = {
    name: paramName,
    value,
    units: options.units,
    provenance: {
      ...options.provenance,
      description: options.notes || options.provenance.description,
    },
  };

  // Register in global registry
  const registry = ProvenanceRegistry.getInstance();
  registry.register(paramProvenance);

  // Return original value (pass-through)
  return value;
}

/**
 * Batch provenance registration
 *
 * Register multiple parameters at once for efficiency.
 *
 * @param params - Array of parameter provenance entries
 *
 * @example
 * registerProvenance([
 *   {
 *     name: 'CO2_BASELINE',
 *     value: 280,
 *     units: 'ppm',
 *     provenance: createVerified('10.1038/nature12121', 'IPCC 2013', 280),
 *   },
 *   {
 *     name: 'TEMP_THRESHOLD',
 *     value: 50,
 *     provenance: createPlaceholder(0.3, 'Needs validation'),
 *   },
 * ]);
 */
export function registerProvenance(params: ParameterProvenance[]): void {
  const registry = ProvenanceRegistry.getInstance();

  for (const param of params) {
    // Validate each provenance
    const validationResult = validateProvenance(param.provenance);

    if (!validationResult.valid) {
      throw new Error(
        `❌ PROVENANCE ERROR: Invalid provenance for parameter '${param.name}': ${validationResult.errors.join(', ')}`
      );
    }

    registry.register(param);
  }
}

/**
 * Get the global provenance registry
 *
 * @returns The singleton ProvenanceRegistry instance
 */
export function getRegistry(): ProvenanceRegistry {
  return ProvenanceRegistry.getInstance();
}

/**
 * Utility: Check if all parameters have provenance
 *
 * @returns Array of parameter names without provenance
 */
export function checkCoverage(parameterNames: string[]): string[] {
  const registry = ProvenanceRegistry.getInstance();
  return parameterNames.filter((name) => !registry.has(name));
}

/**
 * Utility: Get provenance summary statistics
 */
export function getProvenanceStats(): {
  total: number;
  placeholder: number;
  informed: number;
  verified: number;
  needsValidation: number;
} {
  const registry = ProvenanceRegistry.getInstance();
  const all = registry.getAll();

  return {
    total: all.length,
    placeholder: all.filter((p) => p.provenance.type === 'PLACEHOLDER').length,
    informed: all.filter((p) => p.provenance.type === 'INFORMED').length,
    verified: all.filter((p) => p.provenance.type === 'VERIFIED').length,
    needsValidation: registry.getNeedsValidation().length,
  };
}
