/**
 * Mock Data - Static data and generators for the Chatten Dashboard
 */

import { ModelCategory, type AIModel, type PerformanceMetrics } from '../types';

/**
 * Sample AI models available on the platform
 */
export const MOCK_MODELS: AIModel[] = [
  { id: 'gpt-4', name: 'GPT-4 Turbo', category: ModelCategory.LLM, provider: 'OpenAI' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', category: ModelCategory.LLM, provider: 'OpenAI' },
  { id: 'claude-3', name: 'Claude 3 Opus', category: ModelCategory.LLM, provider: 'Anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', category: ModelCategory.LLM, provider: 'Anthropic' },
  { id: 'llama-70b', name: 'Llama 2 70B', category: ModelCategory.LLM, provider: 'Meta' },
  { id: 'mistral-large', name: 'Mistral Large', category: ModelCategory.LLM, provider: 'Mistral' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', category: ModelCategory.IMAGE_GEN, provider: 'Stability AI' },
  { id: 'dall-e-3', name: 'DALL-E 3', category: ModelCategory.IMAGE_GEN, provider: 'OpenAI' },
  { id: 'whisper-large', name: 'Whisper Large', category: ModelCategory.AUDIO, provider: 'OpenAI' },
  { id: 'text-embedding-3', name: 'Text Embedding 3', category: ModelCategory.EMBEDDING, provider: 'OpenAI' },
  { id: 'gpt-4-vision', name: 'GPT-4 Vision', category: ModelCategory.MULTIMODAL, provider: 'OpenAI' },
];

/**
 * Mock wallet address
 */
export const MOCK_WALLET_ADDRESS = 'NXV7ZhHiyM1aHXwpVsRZC6BEpDmYPmXt9E';

/**
 * Base prices for each model (in GAS)
 */
export const BASE_PRICES: Record<string, number> = {
  'gpt-4': 850000,
  'gpt-3.5': 120000,
  'claude-3': 920000,
  'claude-3-sonnet': 450000,
  'llama-70b': 280000,
  'mistral-large': 380000,
  'stable-diffusion-xl': 550000,
  'dall-e-3': 680000,
  'whisper-large': 180000,
  'text-embedding-3': 45000,
  'gpt-4-vision': 780000,
};

/**
 * Generate mock performance metrics for a model
 */
export function generateMockMetrics(modelId: string): PerformanceMetrics {
  // Seed based on model ID for consistent values
  const seed = modelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed + min * max) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  return {
    avg_latency_ms: random(30, 200),
    p95_latency_ms: random(80, 400),
    p99_latency_ms: random(150, 800),
    tokens_per_second: random(100, 1500),
    requests_per_minute: random(50, 500),
    accuracy_score: random(0.85, 0.99),
    benchmark_score: random(60, 95),
    uptime_percentage: random(95, 99.99),
    error_rate: random(0.001, 0.05),
    cost_per_1k_tokens: random(0.001, 0.05),
    measurement_timestamp: new Date().toISOString(),
    sample_size: Math.floor(random(1000, 50000)),
  };
}

/**
 * Generate price with slight variation
 */
export function generateMockPrice(modelId: string): number {
  const basePrice = BASE_PRICES[modelId] || 500000;
  const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
  return Math.floor(basePrice * (1 + variation));
}

/**
 * Generate price history for charts
 */
export function generatePriceHistory(modelId: string, days: number): Array<{ timestamp: string; price: number; volume: number }> {
  const basePrice = BASE_PRICES[modelId] || 500000;
  const now = Date.now();
  const msPerDay = 86400000;
  const points: Array<{ timestamp: string; price: number; volume: number }> = [];

  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now - i * msPerDay).toISOString();
    const dayVariation = Math.sin(i * 0.3) * 0.05 + (Math.random() - 0.5) * 0.02;
    const price = Math.floor(basePrice * (1 + dayVariation));
    const volume = Math.floor(Math.random() * 1000000 + 500000);

    points.push({ timestamp, price, volume });
  }

  return points;
}

/**
 * Q-Score thresholds (from Python backend)
 */
export const Q_SCORE_THRESHOLDS = {
  MIN_SCORE_FOR_MINT: 50,
  EXCELLENT_THRESHOLD: 80,
  GOOD_THRESHOLD: 60,
};

/**
 * Latency score thresholds (ms)
 */
export const LATENCY_THRESHOLDS = [
  { max: 50, score: 1.0 },
  { max: 100, score: 0.8 },
  { max: 200, score: 0.6 },
  { max: 500, score: 0.4 },
  { max: 1000, score: 0.2 },
  { max: Infinity, score: 0.0 },
];

/**
 * Throughput score thresholds (tokens/second)
 */
export const THROUGHPUT_THRESHOLDS = [
  { min: 1000, score: 1.0 },
  { min: 500, score: 0.8 },
  { min: 200, score: 0.6 },
  { min: 100, score: 0.4 },
  { min: 50, score: 0.2 },
  { min: 0, score: 0.0 },
];
