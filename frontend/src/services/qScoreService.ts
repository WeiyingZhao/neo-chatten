/**
 * Q-Score Service - Mock API for Q-Score calculations
 * Mirrors Python backend logic from tools/market_tools.py
 */

import { delay } from '../lib/utils';
import type { QScoreResult, PerformanceMetrics, ModelCategory } from '../types';
import { MOCK_MODELS, generateMockMetrics, Q_SCORE_THRESHOLDS, LATENCY_THRESHOLDS, THROUGHPUT_THRESHOLDS } from './mockData';

/**
 * Calculate latency score (0-1) based on avg_latency_ms
 * Mirrors Python _calculate_latency_score
 */
function calculateLatencyScore(metrics: PerformanceMetrics): number {
  const latency = metrics.avg_latency_ms;
  if (latency <= 0) return 0.0;

  for (const threshold of LATENCY_THRESHOLDS) {
    if (latency < threshold.max) {
      return threshold.score;
    }
  }
  return 0.0;
}

/**
 * Calculate throughput score (0-1) based on tokens_per_second
 * Mirrors Python _calculate_throughput_score
 */
function calculateThroughputScore(metrics: PerformanceMetrics): number {
  const tps = metrics.tokens_per_second;

  for (const threshold of THROUGHPUT_THRESHOLDS) {
    if (tps >= threshold.min) {
      return threshold.score;
    }
  }
  return 0.0;
}

/**
 * Calculate quality score (0-1) based on accuracy and benchmark
 * Mirrors Python _calculate_quality_score
 */
function calculateQualityScore(metrics: PerformanceMetrics): number {
  const accuracy = Math.min(Math.max(metrics.accuracy_score, 0.0), 1.0);
  const benchmark = Math.min(Math.max(metrics.benchmark_score / 100.0, 0.0), 1.0);

  return accuracy * 0.6 + benchmark * 0.4;
}

/**
 * Calculate reliability score (0-1) based on uptime and error rate
 * Mirrors Python _calculate_reliability_score
 */
function calculateReliabilityScore(metrics: PerformanceMetrics): number {
  const uptime = metrics.uptime_percentage;
  let uptimeScore: number;

  if (uptime >= 99.9) uptimeScore = 1.0;
  else if (uptime >= 99) uptimeScore = 0.9;
  else if (uptime >= 95) uptimeScore = 0.5;
  else if (uptime >= 90) uptimeScore = 0.2;
  else uptimeScore = 0.0;

  const errorRate = metrics.error_rate;
  let errorScore: number;

  if (errorRate <= 0) errorScore = 1.0;
  else if (errorRate <= 0.01) errorScore = 0.9;
  else if (errorRate <= 0.05) errorScore = 0.5;
  else if (errorRate < 0.10) errorScore = 0.2;
  else errorScore = 0.0;

  return uptimeScore * 0.5 + errorScore * 0.5;
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  qScore: number,
  latencyScore: number,
  throughputScore: number,
  qualityScore: number,
  reliabilityScore: number
): string[] {
  const recommendations: string[] = [];

  if (latencyScore < 0.5) {
    recommendations.push('Consider optimizing inference latency');
  }
  if (throughputScore < 0.5) {
    recommendations.push('Throughput could be improved with batching');
  }
  if (qualityScore < 0.5) {
    recommendations.push('Model accuracy needs improvement');
  }
  if (reliabilityScore < 0.5) {
    recommendations.push('Improve uptime and reduce error rates');
  }

  if (qScore >= Q_SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) {
    recommendations.push('Excellent performance - eligible for premium rates');
  } else if (qScore >= Q_SCORE_THRESHOLDS.MIN_SCORE_FOR_MINT) {
    recommendations.push('Good performance - eligible for token minting');
  } else {
    recommendations.push('Below threshold - improvements needed before minting');
  }

  return recommendations;
}

/**
 * Get model category from ID
 */
function getModelCategory(modelId: string): ModelCategory {
  const model = MOCK_MODELS.find(m => m.id === modelId);
  return model?.category || 'llm' as ModelCategory;
}

/**
 * Calculate Q-Score for a model
 */
export async function calculateQScore(
  modelId: string,
  metrics?: PerformanceMetrics
): Promise<QScoreResult> {
  await delay(350);

  const metricsData = metrics || generateMockMetrics(modelId);

  const latencyScore = calculateLatencyScore(metricsData);
  const throughputScore = calculateThroughputScore(metricsData);
  const qualityScore = calculateQualityScore(metricsData);
  const reliabilityScore = calculateReliabilityScore(metricsData);

  const qScore = (
    latencyScore * 0.25 +
    throughputScore * 0.25 +
    qualityScore * 0.25 +
    reliabilityScore * 0.25
  ) * 100;

  const mintEligible = qScore >= Q_SCORE_THRESHOLDS.MIN_SCORE_FOR_MINT;

  const recommendations = generateRecommendations(
    qScore,
    latencyScore,
    throughputScore,
    qualityScore,
    reliabilityScore
  );

  return {
    model_id: modelId,
    q_score: qScore,
    category: getModelCategory(modelId),
    metrics: metricsData,
    latency_score: latencyScore * 25,
    throughput_score: throughputScore * 25,
    quality_score: qualityScore * 25,
    reliability_score: reliabilityScore * 25,
    recommendations,
    mint_eligible: mintEligible,
  };
}

/**
 * Compare Q-Scores across multiple models
 */
export async function compareModels(modelIds: string[]): Promise<QScoreResult[]> {
  const results = await Promise.all(modelIds.map(id => calculateQScore(id)));
  return results.sort((a, b) => b.q_score - a.q_score);
}

/**
 * Get Q-Scores for all models
 */
export async function getAllQScores(): Promise<QScoreResult[]> {
  const modelIds = MOCK_MODELS.map(m => m.id);
  return compareModels(modelIds);
}

export const qScoreService = {
  calculateQScore,
  compareModels,
  getAllQScores,
};
