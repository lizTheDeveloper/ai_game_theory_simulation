/**
 * ML Model Server
 *
 * Infrastructure for serving ML models (Hugging Face, OpenAI)
 *
 * Features:
 * - Model loading and caching
 * - Batch prediction
 * - LRU cache for predictions
 * - OWASP A06: Dependency scanning
 */

import { LRUCache } from 'lru-cache';
import { pipeline, Pipeline } from '@xenova/transformers';
import OpenAI from 'openai';

/**
 * Model types supported
 */
export type ModelType =
  | 'embedding' // Text embeddings
  | 'classification' // Text classification
  | 'similarity' // Semantic similarity
  | 'anomaly'; // Anomaly detection

/**
 * Model configuration
 */
export interface ModelConfig {
  type: ModelType;
  provider: 'huggingface' | 'openai';
  modelId: string;
  cacheSize?: number;
  cacheTTL?: number; // milliseconds
}

/**
 * Prediction cache entry
 */
interface CacheEntry {
  input: string;
  output: any;
  timestamp: number;
}

/**
 * Model Server
 *
 * Manages ML model loading, caching, and inference
 */
export class ModelServer {
  private models: Map<string, Pipeline | OpenAI> = new Map();
  private cache: LRUCache<string, CacheEntry>;
  private openaiClient?: OpenAI;

  constructor(cacheSize: number = 10000, cacheTTL: number = 3600000) {
    // Initialize prediction cache (1 hour TTL by default)
    this.cache = new LRUCache({
      max: cacheSize,
      ttl: cacheTTL,
      updateAgeOnGet: true,
    });

    // Initialize OpenAI client if API key available
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Load model (lazy loading)
   */
  async loadModel(config: ModelConfig): Promise<void> {
    const { type, provider, modelId } = config;
    const cacheKey = `${provider}:${modelId}`;

    if (this.models.has(cacheKey)) {
      console.log(`Model already loaded: ${cacheKey}`);
      return;
    }

    console.log(`Loading model: ${cacheKey}...`);

    if (provider === 'huggingface') {
      // Load Hugging Face model
      const pipe = await pipeline(this.getTaskForType(type), modelId);
      this.models.set(cacheKey, pipe as any);
    } else if (provider === 'openai') {
      // OpenAI models don't need loading, just verify client exists
      if (!this.openaiClient) {
        throw new Error('OpenAI API key not configured');
      }
      this.models.set(cacheKey, this.openaiClient);
    }

    console.log(`✅ Model loaded: ${cacheKey}`);
  }

  /**
   * Get embedding for text
   *
   * @param text - Input text
   * @param config - Model configuration
   * @returns Embedding vector
   */
  async getEmbedding(text: string, config: ModelConfig): Promise<number[]> {
    const cacheKey = this.getCacheKey('embedding', text, config);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return cached.output;
    }

    // Ensure model is loaded
    await this.loadModel(config);

    let embedding: number[];

    if (config.provider === 'openai') {
      // OpenAI embedding
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.openaiClient.embeddings.create({
        model: config.modelId,
        input: text,
      });

      embedding = response.data[0].embedding;
    } else {
      // Hugging Face embedding
      const modelKey = `${config.provider}:${config.modelId}`;
      const model = this.models.get(modelKey) as Pipeline;

      if (!model) {
        throw new Error(`Model not loaded: ${modelKey}`);
      }

      const output = await model(text);
      embedding = Array.from(output.data);
    }

    // Cache result
    this.cache.set(cacheKey, {
      input: text,
      output: embedding,
      timestamp: Date.now(),
    });

    return embedding;
  }

  /**
   * Calculate cosine similarity between two texts
   *
   * @param text1 - First text
   * @param text2 - Second text
   * @param config - Model configuration
   * @returns Similarity score (0-1)
   */
  async calculateSimilarity(
    text1: string,
    text2: string,
    config: ModelConfig
  ): Promise<number> {
    const [embedding1, embedding2] = await Promise.all([
      this.getEmbedding(text1, config),
      this.getEmbedding(text2, config),
    ]);

    return this.cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Batch embedding generation
   *
   * @param texts - Array of texts
   * @param config - Model configuration
   * @returns Array of embeddings
   */
  async batchGetEmbeddings(
    texts: string[],
    config: ModelConfig
  ): Promise<number[][]> {
    // Check cache for all texts
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const uncachedIndices: number[] = [];

    for (let i = 0; i < texts.length; i++) {
      const cacheKey = this.getCacheKey('embedding', texts[i], config);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        results[i] = cached.output;
      } else {
        uncachedIndices.push(i);
      }
    }

    // Fetch uncached embeddings
    if (uncachedIndices.length > 0) {
      const uncachedTexts = uncachedIndices.map((i) => texts[i]);

      if (config.provider === 'openai') {
        // OpenAI batch embedding
        if (!this.openaiClient) {
          throw new Error('OpenAI client not initialized');
        }

        const response = await this.openaiClient.embeddings.create({
          model: config.modelId,
          input: uncachedTexts,
        });

        for (let i = 0; i < uncachedIndices.length; i++) {
          const originalIndex = uncachedIndices[i];
          const embedding = response.data[i].embedding;
          results[originalIndex] = embedding;

          // Cache result
          const cacheKey = this.getCacheKey('embedding', texts[originalIndex], config);
          this.cache.set(cacheKey, {
            input: texts[originalIndex],
            output: embedding,
            timestamp: Date.now(),
          });
        }
      } else {
        // Hugging Face batch embedding
        const embeddings = await Promise.all(
          uncachedTexts.map((text) => this.getEmbedding(text, config))
        );

        for (let i = 0; i < uncachedIndices.length; i++) {
          const originalIndex = uncachedIndices[i];
          results[originalIndex] = embeddings[i];
        }
      }
    }

    return results as number[][];
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  // Private helper methods

  private getCacheKey(operation: string, input: string, config: ModelConfig): string {
    return `${operation}:${config.provider}:${config.modelId}:${input}`;
  }

  private getTaskForType(type: ModelType): any {
    switch (type) {
      case 'embedding':
        return 'feature-extraction' as any;
      case 'classification':
        return 'text-classification' as any;
      case 'similarity':
        return 'feature-extraction' as any;
      case 'anomaly':
        return 'feature-extraction' as any;
      default:
        throw new Error(`Unknown model type: ${type}`);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateHitRate(): number {
    // TODO: Track hits/misses for accurate hit rate
    return 0.0;
  }
}

/**
 * Singleton model server instance
 */
export const modelServer = new ModelServer();
