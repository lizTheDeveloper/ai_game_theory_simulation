/**
 * Multi-Provider LLM Manager
 *
 * Manages multiple LLM API providers with automatic rotation based on:
 * - Token limits (input + output tokens)
 * - Request limits (per minute/hour/day)
 * - Provider availability
 * - Cost optimization
 *
 * Features:
 * - YAML-based configuration
 * - Token tracking (not just requests)
 * - Automatic provider rotation
 * - Usage persistence between runs
 * - Priority-based fallback
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface ProviderLimits {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  tokens_per_minute: number;
  tokens_per_hour?: number;
  tokens_per_day: number;
}

export interface ProviderQueue {
  max_concurrent: number;
  retry_on_failure: boolean;
  max_retries: number;
  retry_delay_ms: number;
}

export interface ModelTierConfig {
  model_name: string;
  tier: string;  // '7b', '20b', '70b', '100b', '405b', etc.
  tokens_per_request_avg: number;
  use_cases: string[];
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  api_endpoint: string;
  api_key_env: string | null;
  models: {
    small_7b?: ModelTierConfig;
    medium_20b?: ModelTierConfig;
    medium_32b?: ModelTierConfig;
    medium_70b?: ModelTierConfig;
    large_70b?: ModelTierConfig;
    large_100b?: ModelTierConfig;
    large_405b?: ModelTierConfig;
  };
  limits: ProviderLimits;
  queue: ProviderQueue;
  temperature: number;
  max_tokens: number;
}

export interface GlobalConfig {
  rotation_strategy: 'round-robin' | 'token-aware' | 'request-aware' | 'cost-aware';
  retry_on_provider_failure: boolean;
  log_provider_switches: boolean;
  tier_selection_strategy: 'auto' | 'prefer-small' | 'prefer-large';
}

export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type ModelTier = 'small' | 'medium' | 'large';

export interface UsageData {
  [provider: string]: {
    [date: string]: {
      requests: number;
      tokens: number;
      tokens_input: number;
      tokens_output: number;
    };
  };
}

export interface MultiProviderConfig {
  global: GlobalConfig;
  providers: ProviderConfig[];
  usage_tracking: UsageData;
}

interface ProviderUsage {
  requests_minute: number;
  requests_hour: number;
  requests_day: number;
  tokens_minute: number;
  tokens_hour: number;
  tokens_day: number;
  last_request_time: number;
  minute_window_start: number;
  hour_window_start: number;
  day_window_start: number;
}

export class ProviderManager {
  private config!: MultiProviderConfig; // Initialized in loadConfig()
  private configPath: string;
  private currentProviderIndex: number = 0;
  private providerUsage: Map<string, ProviderUsage> = new Map();
  private lastSaveTime: number = Date.now();

  constructor(configPath: string = 'llm-providers.yaml') {
    this.configPath = path.resolve(configPath);
    this.loadConfig();
    this.initializeUsageTracking();
  }

  /**
   * Load configuration from YAML file
   */
  private loadConfig(): void {
    try {
      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      this.config = yaml.load(fileContents) as MultiProviderConfig;

      // Ensure usage_tracking exists
      if (!this.config.usage_tracking) {
        this.config.usage_tracking = {};
      }

      // Filter to enabled providers and sort by priority
      this.config.providers = this.config.providers
        .filter(p => p.enabled)
        .sort((a, b) => a.priority - b.priority);

      if (this.config.providers.length === 0) {
        throw new Error('No enabled providers in configuration');
      }

      console.log(`[Provider Manager] Loaded ${this.config.providers.length} enabled providers`);
    } catch (error) {
      throw new Error(`Failed to load provider config from ${this.configPath}: ${error}`);
    }
  }

  /**
   * Initialize usage tracking for all providers
   */
  private initializeUsageTracking(): void {
    const today = this.getTodayString();

    for (const provider of this.config.providers) {
      // Load persisted usage from YAML
      const persistedUsage = this.config.usage_tracking[provider.name]?.[today] || {
        requests: 0,
        tokens: 0,
        tokens_input: 0,
        tokens_output: 0
      };

      this.providerUsage.set(provider.name, {
        requests_minute: 0,
        requests_hour: 0,
        requests_day: persistedUsage.requests,
        tokens_minute: 0,
        tokens_hour: 0,
        tokens_day: persistedUsage.tokens,
        last_request_time: Date.now(),
        minute_window_start: Date.now(),
        hour_window_start: Date.now(),
        day_window_start: Date.now()
      });
    }
  }

  /**
   * Get the best available provider based on rotation strategy
   */
  public getNextProvider(): ProviderConfig | null {
    const strategy = this.config.global.rotation_strategy;

    // Try all providers in priority order
    for (let i = 0; i < this.config.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.config.providers.length;
      const provider = this.config.providers[providerIndex];

      if (this.canUseProvider(provider)) {
        this.currentProviderIndex = providerIndex;
        return provider;
      }
    }

    // No providers available
    console.warn('[Provider Manager] All providers exhausted or rate-limited');
    return null;
  }

  /**
   * Check if a provider can be used (not rate limited)
   */
  private canUseProvider(provider: ProviderConfig): boolean {
    const usage = this.providerUsage.get(provider.name);
    if (!usage) return false;

    const now = Date.now();

    // Reset windows if expired
    if (now - usage.minute_window_start >= 60000) {
      usage.minute_window_start = now;
      usage.requests_minute = 0;
      usage.tokens_minute = 0;
    }
    if (now - usage.hour_window_start >= 3600000) {
      usage.hour_window_start = now;
      usage.requests_hour = 0;
      usage.tokens_hour = 0;
    }
    if (now - usage.day_window_start >= 86400000) {
      usage.day_window_start = now;
      usage.requests_day = 0;
      usage.tokens_day = 0;
    }

    // Check request limits
    if (provider.limits.requests_per_minute > 0 &&
        usage.requests_minute >= provider.limits.requests_per_minute) {
      return false;
    }
    if (provider.limits.requests_per_hour > 0 &&
        usage.requests_hour >= provider.limits.requests_per_hour) {
      return false;
    }
    if (provider.limits.requests_per_day > 0 &&
        usage.requests_day >= provider.limits.requests_per_day) {
      return false;
    }

    // Check token limits
    if (provider.limits.tokens_per_minute > 0 &&
        usage.tokens_minute >= provider.limits.tokens_per_minute) {
      return false;
    }
    if (provider.limits.tokens_per_hour && provider.limits.tokens_per_hour > 0 &&
        usage.tokens_hour >= provider.limits.tokens_per_hour) {
      return false;
    }
    if (provider.limits.tokens_per_day > 0 &&
        usage.tokens_day >= provider.limits.tokens_per_day) {
      return false;
    }

    return true;
  }

  /**
   * Record usage after a successful API call
   */
  public recordUsage(providerName: string, tokensUsed: number, tokensInput: number, tokensOutput: number): void {
    const usage = this.providerUsage.get(providerName);
    if (!usage) return;

    // Update in-memory usage
    usage.requests_minute++;
    usage.requests_hour++;
    usage.requests_day++;
    usage.tokens_minute += tokensUsed;
    usage.tokens_hour += tokensUsed;
    usage.tokens_day += tokensUsed;
    usage.last_request_time = Date.now();

    // Update persisted usage
    const today = this.getTodayString();
    if (!this.config.usage_tracking[providerName]) {
      this.config.usage_tracking[providerName] = {};
    }
    if (!this.config.usage_tracking[providerName][today]) {
      this.config.usage_tracking[providerName][today] = {
        requests: 0,
        tokens: 0,
        tokens_input: 0,
        tokens_output: 0
      };
    }

    this.config.usage_tracking[providerName][today].requests++;
    this.config.usage_tracking[providerName][today].tokens += tokensUsed;
    this.config.usage_tracking[providerName][today].tokens_input += tokensInput;
    this.config.usage_tracking[providerName][today].tokens_output += tokensOutput;

    // Save every 10 requests to avoid excessive I/O
    if (usage.requests_day % 10 === 0) {
      this.saveUsage();
    }
  }

  /**
   * Get usage statistics for a provider
   */
  public getUsageStats(providerName: string): ProviderUsage | null {
    return this.providerUsage.get(providerName) || null;
  }

  /**
   * Get all usage statistics
   */
  public getAllUsageStats(): Map<string, ProviderUsage> {
    return new Map(this.providerUsage);
  }

  /**
   * Save usage tracking to YAML file
   */
  public saveUsage(): void {
    try {
      const yamlContent = yaml.dump(this.config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true
      });
      fs.writeFileSync(this.configPath, yamlContent, 'utf8');
      this.lastSaveTime = Date.now();
    } catch (error) {
      console.error(`[Provider Manager] Failed to save usage data: ${error}`);
    }
  }

  /**
   * Get API key from environment variable
   */
  public getApiKey(provider: ProviderConfig): string | undefined {
    if (!provider.api_key_env) {
      return undefined; // No API key needed (e.g., LM Studio)
    }
    return process.env[provider.api_key_env];
  }

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  private getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get time until next available slot for a provider (ms)
   */
  public getTimeUntilAvailable(providerName: string): number {
    const usage = this.providerUsage.get(providerName);
    if (!usage) return 0;

    const provider = this.config.providers.find(p => p.name === providerName);
    if (!provider) return 0;

    const now = Date.now();
    const delays: number[] = [];

    // Check minute window
    if (provider.limits.requests_per_minute > 0 &&
        usage.requests_minute >= provider.limits.requests_per_minute) {
      delays.push(60000 - (now - usage.minute_window_start));
    }

    // Check hour window
    if (provider.limits.requests_per_hour > 0 &&
        usage.requests_hour >= provider.limits.requests_per_hour) {
      delays.push(3600000 - (now - usage.hour_window_start));
    }

    // Check day window
    if (provider.limits.requests_per_day > 0 &&
        usage.requests_day >= provider.limits.requests_per_day) {
      delays.push(86400000 - (now - usage.day_window_start));
    }

    // Similar checks for token limits
    if (provider.limits.tokens_per_minute > 0 &&
        usage.tokens_minute >= provider.limits.tokens_per_minute) {
      delays.push(60000 - (now - usage.minute_window_start));
    }
    if (provider.limits.tokens_per_hour && provider.limits.tokens_per_hour > 0 &&
        usage.tokens_hour >= provider.limits.tokens_per_hour) {
      delays.push(3600000 - (now - usage.hour_window_start));
    }
    if (provider.limits.tokens_per_day > 0 &&
        usage.tokens_day >= provider.limits.tokens_per_day) {
      delays.push(86400000 - (now - usage.day_window_start));
    }

    return delays.length > 0 ? Math.min(...delays) : 0;
  }

  /**
   * Print usage summary
   */
  public printUsageSummary(): void {
    console.log('\n=== LLM Provider Usage Summary ===');
    for (const provider of this.config.providers) {
      const usage = this.providerUsage.get(provider.name);
      if (!usage) continue;

      console.log(`\n${provider.name}:`);
      console.log(`  Requests: ${usage.requests_day}/${provider.limits.requests_per_day || '∞'} (day)`);
      console.log(`  Tokens: ${usage.tokens_day}/${provider.limits.tokens_per_day || '∞'} (day)`);
      console.error(`  Available: ${this.canUseProvider(provider) ? '✅' : '🔴'}`);

      if (!this.canUseProvider(provider)) {
        const delay = this.getTimeUntilAvailable(provider.name);
        console.log(`  Next available in: ${Math.ceil(delay / 1000)}s`);
      }
    }
  }

  /**
   * Select model tier based on task complexity
   */
  public selectModelForComplexity(provider: ProviderConfig, complexity: TaskComplexity): ModelTierConfig | null {
    const strategy = this.config.global.tier_selection_strategy;

    // Map complexity to tier preference
    let tierKey: string;
    if (complexity === 'simple') {
      tierKey = 'small_7b';
    } else if (complexity === 'medium') {
      // Try to find medium tier (20b, 32b, or 70b)
      if (provider.models.medium_20b) tierKey = 'medium_20b';
      else if (provider.models.medium_32b) tierKey = 'medium_32b';
      else if (provider.models.medium_70b) tierKey = 'medium_70b';
      else tierKey = 'small_7b'; // Fallback
    } else {
      // complex
      if (provider.models.large_405b) tierKey = 'large_405b';
      else if (provider.models.large_100b) tierKey = 'large_100b';
      else if (provider.models.large_70b) tierKey = 'large_70b';
      else if (provider.models.medium_70b) tierKey = 'medium_70b';
      else tierKey = 'small_7b'; // Fallback
    }

    const model = (provider.models as any)[tierKey] as ModelTierConfig | undefined;

    if (!model) {
      console.warn(`[Provider Manager] No model found for ${complexity} complexity on ${provider.name}`);
      // Fallback to any available model
      return provider.models.small_7b ||
             provider.models.medium_20b ||
             provider.models.medium_32b ||
             provider.models.medium_70b ||
             provider.models.large_70b ||
             provider.models.large_100b ||
             provider.models.large_405b ||
             null;
    }

    if (this.config.global.log_provider_switches) {
      console.log(`[Provider Manager] Selected ${model.model_name} (${model.tier}) for ${complexity} task on ${provider.name}`);
    }

    return model;
  }

  /**
   * Get next available provider with appropriate model tier
   */
  public getNextProviderWithTier(complexity: TaskComplexity): { provider: ProviderConfig, model: ModelTierConfig } | null {
    // Try all providers in priority order
    for (let i = 0; i < this.config.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.config.providers.length;
      const provider = this.config.providers[providerIndex];

      if (this.canUseProvider(provider)) {
        const model = this.selectModelForComplexity(provider, complexity);
        if (model) {
          this.currentProviderIndex = providerIndex;
          return { provider, model };
        }
      }
    }

    // No providers available
    console.warn('[Provider Manager] No providers available with required model tier');
    return null;
  }

  /**
   * Determine task complexity from use case string
   */
  public static classifyTaskComplexity(useCase: string): TaskComplexity {
    const simpleCases = [
      'simple_weight_updates',
      'routine_checks',
      'threshold_evaluations'
    ];

    const complexCases = [
      'complex_reasoning',
      'extinction_scenarios',
      'long_term_strategy'
    ];

    if (simpleCases.includes(useCase)) {
      return 'simple';
    } else if (complexCases.includes(useCase)) {
      return 'complex';
    } else {
      return 'medium';
    }
  }
}

// Singleton instance
let globalProviderManager: ProviderManager | null = null;

/**
 * Get or create global provider manager
 */
export function getProviderManager(configPath?: string): ProviderManager {
  if (!globalProviderManager) {
    globalProviderManager = new ProviderManager(configPath);
  }
  return globalProviderManager;
}

/**
 * Reset global provider manager (for testing)
 */
export function resetProviderManager(): void {
  if (globalProviderManager) {
    globalProviderManager.saveUsage();
    globalProviderManager = null;
  }
}
