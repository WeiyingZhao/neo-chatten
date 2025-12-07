/**
 * Market Service - Mock API for market data
 */

import { delay } from '../lib/utils';
import type { PriceData, MarketAnalysis, PricePoint } from '../types';
import { MOCK_MODELS, BASE_PRICES, generateMockPrice, generatePriceHistory } from './mockData';

/**
 * Get current price for a model
 */
export async function getCurrentPrice(modelId: string): Promise<PriceData> {
  await delay(200);

  const price = generateMockPrice(modelId);
  const price24hAgo = BASE_PRICES[modelId] || 500000;
  const change24h = price - price24hAgo;
  const changePercentage = (change24h / price24hAgo) * 100;

  return {
    model_id: modelId,
    price,
    price_24h_ago: price24hAgo,
    change_24h: change24h,
    change_percentage: changePercentage,
    volume_24h: Math.floor(Math.random() * 5000000 + 1000000),
    high_24h: Math.floor(price * 1.05),
    low_24h: Math.floor(price * 0.95),
  };
}

/**
 * Get prices for all models
 */
export async function getAllPrices(): Promise<PriceData[]> {
  await delay(300);

  return Promise.all(MOCK_MODELS.map(model => getCurrentPrice(model.id)));
}

/**
 * Get market analysis summary
 */
export async function getMarketAnalysis(): Promise<MarketAnalysis> {
  await delay(250);

  return {
    total_models: MOCK_MODELS.length,
    avg_q_score: 72.5,
    top_performers: ['gpt-4', 'claude-3', 'llama-70b'],
    market_liquidity: 15_000_000,
    price_trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
  };
}

/**
 * Get price history for a model
 */
export async function getPriceHistory(modelId: string, days: number = 30): Promise<PricePoint[]> {
  await delay(300);

  return generatePriceHistory(modelId, days);
}

/**
 * Get all available models
 */
export async function getModels() {
  await delay(100);
  return MOCK_MODELS;
}

export const marketService = {
  getCurrentPrice,
  getAllPrices,
  getMarketAnalysis,
  getPriceHistory,
  getModels,
};
