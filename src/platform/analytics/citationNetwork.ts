/**
 * Citation Network Graph Analytics
 *
 * Graph-based analysis of citation relationships
 *
 * Features:
 * - Citation graph construction
 * - Centrality metrics (PageRank, betweenness, degree)
 * - Community detection
 * - Author credibility scoring
 * - Cross-reference validation
 */

import Graph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';
import betweennessCentrality from 'graphology-metrics/centrality/betweenness';
import degreeCentrality from 'graphology-metrics/centrality/degree';

/**
 * Citation node (paper or author)
 */
export interface CitationNode {
  id: string;
  type: 'paper' | 'author';
  title?: string; // For papers
  name?: string; // For authors
  year?: number;
  citations?: number;
  doi?: string;
}

/**
 * Citation edge (citation relationship)
 */
export interface CitationEdge {
  source: string; // Citing paper/author
  target: string; // Cited paper/author
  weight?: number; // Citation frequency
  year?: number; // Year of citation
}

/**
 * Centrality metrics for a node
 */
export interface CentralityMetrics {
  pagerank: number;
  betweenness: number;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
}

/**
 * Author credibility score
 */
export interface AuthorCredibility {
  authorId: string;
  score: number; // 0-1
  metrics: {
    hIndex: number;
    totalCitations: number;
    peerReviewedPapers: number;
    recentPublications: number; // Last 5 years
    centrality: CentralityMetrics;
  };
  rank: 'high' | 'medium' | 'low';
}

/**
 * Citation Network Graph
 */
export class CitationNetwork {
  private graph: Graph;

  constructor() {
    this.graph = new Graph({ multi: false, allowSelfLoops: false });
  }

  /**
   * Add paper to graph
   */
  addPaper(node: CitationNode): void {
    if (node.type !== 'paper') {
      throw new Error('Node must be of type "paper"');
    }

    if (!this.graph.hasNode(node.id)) {
      this.graph.addNode(node.id, node);
    }
  }

  /**
   * Add author to graph
   */
  addAuthor(node: CitationNode): void {
    if (node.type !== 'author') {
      throw new Error('Node must be of type "author"');
    }

    if (!this.graph.hasNode(node.id)) {
      this.graph.addNode(node.id, node);
    }
  }

  /**
   * Add citation edge
   */
  addCitation(edge: CitationEdge): void {
    // Ensure nodes exist
    if (!this.graph.hasNode(edge.source)) {
      throw new Error(`Source node not found: ${edge.source}`);
    }
    if (!this.graph.hasNode(edge.target)) {
      throw new Error(`Target node not found: ${edge.target}`);
    }

    // Add or update edge
    if (this.graph.hasEdge(edge.source, edge.target)) {
      // Update weight
      const currentWeight = this.graph.getEdgeAttribute(edge.source, edge.target, 'weight') || 0;
      this.graph.setEdgeAttribute(edge.source, edge.target, 'weight', currentWeight + (edge.weight || 1));
    } else {
      this.graph.addDirectedEdge(edge.source, edge.target, {
        weight: edge.weight || 1,
        year: edge.year,
      });
    }
  }

  /**
   * Calculate centrality metrics for all nodes
   */
  calculateCentrality(): Map<string, CentralityMetrics> {
    const pagerankScores = pagerank(this.graph as any);
    const betweennessScores = betweennessCentrality(this.graph as any);
    const degreeScores = degreeCentrality(this.graph as any);

    const metrics = new Map<string, CentralityMetrics>();

    for (const node of this.graph.nodes()) {
      metrics.set(node, {
        pagerank: pagerankScores[node] || 0,
        betweenness: betweennessScores[node] || 0,
        inDegree: this.graph.inDegree(node),
        outDegree: this.graph.outDegree(node),
        totalDegree: degreeScores[node] || 0,
      });
    }

    return metrics;
  }

  /**
   * Calculate author credibility score
   */
  calculateAuthorCredibility(authorId: string): AuthorCredibility {
    if (!this.graph.hasNode(authorId)) {
      throw new Error(`Author not found: ${authorId}`);
    }

    const author = this.graph.getNodeAttributes(authorId) as CitationNode;

    if (author.type !== 'author') {
      throw new Error(`Node is not an author: ${authorId}`);
    }

    // Calculate centrality metrics
    const centrality = this.calculateCentrality().get(authorId) || {
      pagerank: 0,
      betweenness: 0,
      inDegree: 0,
      outDegree: 0,
      totalDegree: 0,
    };

    // Calculate credibility score (weighted combination)
    const hIndex = this.calculateHIndex(authorId);
    const totalCitations = author.citations || 0;
    const peerReviewedPapers = this.countPeerReviewedPapers(authorId);
    const recentPublications = this.countRecentPublications(authorId, 5);

    const score =
      0.3 * Math.min(hIndex / 50, 1) + // H-index (normalized to 50)
      0.2 * Math.min(totalCitations / 1000, 1) + // Total citations (normalized to 1000)
      0.2 * centrality.pagerank * 10 + // PageRank (scaled)
      0.15 * Math.min(peerReviewedPapers / 20, 1) + // Peer-reviewed papers (normalized to 20)
      0.15 * Math.min(recentPublications / 10, 1); // Recent publications (normalized to 10)

    const rank: 'high' | 'medium' | 'low' = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';

    return {
      authorId,
      score,
      metrics: {
        hIndex,
        totalCitations,
        peerReviewedPapers,
        recentPublications,
        centrality,
      },
      rank,
    };
  }

  /**
   * Find most influential papers (by PageRank)
   */
  findInfluentialPapers(limit: number = 10): Array<{ id: string; score: number; node: CitationNode }> {
    const pagerankScores = pagerank(this.graph);
    const papers: Array<{ id: string; score: number; node: CitationNode }> = [];

    for (const node of this.graph.nodes()) {
      const attrs = this.graph.getNodeAttributes(node) as CitationNode;
      if (attrs.type === 'paper') {
        papers.push({
          id: node,
          score: pagerankScores[node] || 0,
          node: attrs,
        });
      }
    }

    papers.sort((a, b) => b.score - a.score);
    return papers.slice(0, limit);
  }

  /**
   * Detect citation communities (simplified)
   */
  detectCommunities(): Map<string, Set<string>> {
    // TODO: Implement proper community detection (Louvain, etc.)
    // For now, use simple connected components

    const communities = new Map<string, Set<string>>();
    const visited = new Set<string>();
    let communityId = 0;

    for (const node of this.graph.nodes()) {
      if (!visited.has(node)) {
        const community = this.dfs(node, visited);
        communities.set(`community_${communityId++}`, community);
      }
    }

    return communities;
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return {
      nodes: this.graph.order,
      edges: this.graph.size,
      papers: this.graph.nodes().filter((n) => this.graph.getNodeAttribute(n, 'type') === 'paper').length,
      authors: this.graph.nodes().filter((n) => this.graph.getNodeAttribute(n, 'type') === 'author').length,
      avgDegree: this.graph.size / this.graph.order,
      density: (2 * this.graph.size) / (this.graph.order * (this.graph.order - 1)),
    };
  }

  // Private helper methods

  private calculateHIndex(authorId: string): number {
    // TODO: Implement proper h-index calculation
    // For now, use placeholder based on citations
    const author = this.graph.getNodeAttributes(authorId) as CitationNode;
    return Math.floor(Math.sqrt(author.citations || 0));
  }

  private countPeerReviewedPapers(authorId: string): number {
    // TODO: Implement actual count
    // For now, use out-degree as proxy
    return this.graph.outDegree(authorId);
  }

  private countRecentPublications(authorId: string, years: number): number {
    // TODO: Implement actual count based on year
    // For now, use simple estimate
    return Math.floor(this.graph.outDegree(authorId) * 0.5);
  }

  private dfs(startNode: string, visited: Set<string>): Set<string> {
    const component = new Set<string>();
    const stack = [startNode];

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (!visited.has(node)) {
        visited.add(node);
        component.add(node);

        // Add neighbors
        for (const neighbor of this.graph.neighbors(node)) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return component;
  }
}

/**
 * Singleton citation network
 */
export const citationNetwork = new CitationNetwork();
