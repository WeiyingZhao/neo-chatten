/**
 * Market Types - Mirrors Python backend dataclasses from tools/market_tools.py
 */

export const ModelCategory = {
  LLM: 'llm',
  IMAGE_GEN: 'image_generation',
  EMBEDDING: 'embedding',
  AUDIO: 'audio',
  MULTIMODAL: 'multimodal',
} as const;

export type ModelCategory = (typeof ModelCategory)[keyof typeof ModelCategory];

/**
 * Performance metrics for Q-score calculation.
 * Mirrors Python PerformanceMetrics dataclass.
 */
export interface PerformanceMetrics {
  // Latency metrics (in milliseconds)
  avg_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;

  // Throughput metrics
  tokens_per_second: number;
  requests_per_minute: number;

  // Quality metrics
  accuracy_score: number;       // 0-1 scale
  benchmark_score: number;      // Model-specific benchmark

  // Availability metrics
  uptime_percentage: number;    // 0-100
  error_rate: number;           // 0-1 scale

  // Cost metrics
  cost_per_1k_tokens: number;

  // Metadata
  measurement_timestamp: string | null;
  sample_size: number;
}

/**
 * Result of Q-score calculation.
 * Mirrors Python QScoreResult dataclass.
 */
export interface QScoreResult {
  model_id: string;
  q_score: number;              // 0-100 composite score
  category: ModelCategory;
  metrics: PerformanceMetrics;

  // Component scores (0-25 max each)
  latency_score: number;
  throughput_score: number;
  quality_score: number;
  reliability_score: number;

  // Recommendations
  recommendations: string[];
  mint_eligible: boolean;
}

/**
 * Market-wide analysis result.
 * Mirrors Python MarketAnalysis dataclass.
 */
export interface MarketAnalysis {
  total_models: number;
  avg_q_score: number;
  top_performers: string[];
  market_liquidity: number;
  price_trend: 'up' | 'down' | 'stable';
}

/**
 * Price data for display and charts.
 */
export interface PriceData {
  model_id: string;
  price: number;
  price_24h_ago: number;
  change_24h: number;
  change_percentage: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
}

/**
 * Historical price point for charts.
 */
export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

/**
 * AI Model information.
 */
export interface AIModel {
  id: string;
  name: string;
  category: ModelCategory;
  provider: string;
  description?: string;
}
