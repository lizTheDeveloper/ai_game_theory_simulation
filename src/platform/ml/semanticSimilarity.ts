/**
 * Semantic Similarity Service
 *
 * Provides semantic similarity matching for citation verification
 *
 * Features:
 * - Text embedding generation
 * - Cosine similarity calculation
 * - Threshold-based matching
 * - Vector search (FAISS-like in-memory)
 */

import { modelServer, ModelConfig } from './modelServer';

/**
 * Similarity match result
 */
export interface SimilarityMatch {
  text: string;
  score: number;
  index?: number;
}

/**
 * Similarity threshold levels
 */
export enum SimilarityThreshold {
  EXACT = 0.95, // Near-exact match
  HIGH = 0.85, // High similarity
  MEDIUM = 0.7, // Medium similarity
  LOW = 0.5, // Low similarity
}

/**
 * Semantic Similarity Service
 */
export class SemanticSimilarityService {
  private embeddings: Map<string, number[]> = new Map();
  private texts: string[] = [];

  constructor(
    private readonly modelConfig: ModelConfig = {
      type: 'embedding',
      provider: 'openai',
      modelId: 'text-embedding-3-small',
    }
  ) {}

  /**
   * Index a corpus of texts for similarity search
   *
   * @param corpus - Array of texts to index
   */
  async indexCorpus(corpus: string[]): Promise<void> {
    console.log(`Indexing ${corpus.length} texts...`);

    // Generate embeddings for all texts
    const embeddings = await modelServer.batchGetEmbeddings(corpus, this.modelConfig);

    // Store in index
    for (let i = 0; i < corpus.length; i++) {
      this.texts.push(corpus[i]);
      this.embeddings.set(corpus[i], embeddings[i]);
    }

    console.log(`✅ Indexed ${corpus.length} texts`);
  }

  /**
   * Find most similar texts to a query
   *
   * @param query - Query text
   * @param topK - Number of top results to return
   * @param threshold - Minimum similarity score
   * @returns Array of similar texts with scores
   */
  async findSimilar(
    query: string,
    topK: number = 5,
    threshold: number = SimilarityThreshold.MEDIUM
  ): Promise<SimilarityMatch[]> {
    // Get query embedding
    const queryEmbedding = await modelServer.getEmbedding(query, this.modelConfig);

    // Calculate similarities
    const similarities: SimilarityMatch[] = [];

    for (let i = 0; i < this.texts.length; i++) {
      const text = this.texts[i];
      const embedding = this.embeddings.get(text);

      if (!embedding) continue;

      const score = this.cosineSimilarity(queryEmbedding, embedding);

      if (score >= threshold) {
        similarities.push({ text, score, index: i });
      }
    }

    // Sort by score descending
    similarities.sort((a, b) => b.score - a.score);

    // Return top K
    return similarities.slice(0, topK);
  }

  /**
   * Check if two texts are semantically similar
   *
   * @param text1 - First text
   * @param text2 - Second text
   * @param threshold - Similarity threshold
   * @returns True if similar, false otherwise
   */
  async areSimilar(
    text1: string,
    text2: string,
    threshold: number = SimilarityThreshold.HIGH
  ): Promise<boolean> {
    const score = await modelServer.calculateSimilarity(text1, text2, this.modelConfig);
    return score >= threshold;
  }

  /**
   * Calculate similarity score between two texts
   *
   * @param text1 - First text
   * @param text2 - Second text
   * @returns Similarity score (0-1)
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    return modelServer.calculateSimilarity(text1, text2, this.modelConfig);
  }

  /**
   * Verify if a claim matches a source
   *
   * @param claim - Claim text
   * @param source - Source text
   * @returns Verification result with similarity score
   */
  async verifyClaim(
    claim: string,
    source: string
  ): Promise<{
    verified: boolean;
    similarity: number;
    threshold: SimilarityThreshold;
  }> {
    const similarity = await this.calculateSimilarity(claim, source);

    let verified = false;
    let threshold: SimilarityThreshold = SimilarityThreshold.LOW;

    if (similarity >= SimilarityThreshold.EXACT) {
      verified = true;
      threshold = SimilarityThreshold.EXACT;
    } else if (similarity >= SimilarityThreshold.HIGH) {
      verified = true;
      threshold = SimilarityThreshold.HIGH;
    } else if (similarity >= SimilarityThreshold.MEDIUM) {
      verified = true;
      threshold = SimilarityThreshold.MEDIUM;
    }

    return { verified, similarity, threshold };
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      textsIndexed: this.texts.length,
      embeddingsCached: this.embeddings.size,
      modelConfig: this.modelConfig,
    };
  }

  /**
   * Clear index
   */
  clearIndex() {
    this.texts = [];
    this.embeddings.clear();
  }

  // Private helper methods

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
}

/**
 * Singleton semantic similarity service
 */
export const semanticSimilarity = new SemanticSimilarityService();
