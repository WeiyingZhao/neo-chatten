/**
 * Agent Service - Mock API for agent activity tracking
 */

import { delay, generateId } from '../lib/utils';
import type { AgentDecision, AgentStatus, AgentAction } from '../types';
import { generateMockPrice } from './mockData';

/**
 * Mock agent status
 */
const mockAgentStatus: AgentStatus = {
  name: 'ChattenTrader',
  status: 'active',
  last_activity: new Date().toISOString(),
  total_trades: 47,
  success_rate: 0.94,
  total_volume: 125_000_000,
  profit_loss: 8_500_000,
};

/**
 * Mock agent decisions
 */
const mockDecisions: AgentDecision[] = [
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 120000).toISOString(),
    action: 'check_price',
    model_id: 'gpt-4',
    reasoning: 'Scheduled price check for GPT-4',
    result: {
      success: true,
      price: 850000,
    },
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 300000).toISOString(),
    action: 'buy',
    model_id: 'gpt-4',
    reasoning: 'Price below threshold (850,000 < 1,000,000). Executing buy order.',
    parameters: { gas_amount: 2.0 },
    result: {
      success: true,
      tx_hash: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 235_294_117,
    },
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 600000).toISOString(),
    action: 'analyze',
    model_id: 'claude-3',
    reasoning: 'Analyzing Q-Score for Claude 3 to evaluate trading opportunity',
    result: {
      success: true,
    },
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 900000).toISOString(),
    action: 'hold',
    model_id: 'llama-70b',
    reasoning: 'Current position is optimal. No action needed.',
    result: {
      success: true,
    },
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    action: 'check_price',
    model_id: 'gpt-4',
    reasoning: 'Scheduled price check for GPT-4',
    result: {
      success: true,
      price: 870000,
    },
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'sell',
    model_id: 'gpt-3.5',
    reasoning: 'Taking profit on GPT-3.5 position after 15% price increase',
    parameters: { amount: 100_000_000 },
    result: {
      success: true,
      tx_hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount: 100_000_000,
    },
  },
];

/**
 * Get current agent status
 */
export async function getAgentStatus(): Promise<AgentStatus> {
  await delay(150);

  // Update last activity to now if status is active
  if (mockAgentStatus.status === 'active') {
    mockAgentStatus.last_activity = new Date().toISOString();
  }

  return { ...mockAgentStatus };
}

/**
 * Get agent decision history
 */
export async function getAgentDecisions(limit: number = 20): Promise<AgentDecision[]> {
  await delay(200);
  return mockDecisions.slice(0, limit);
}

/**
 * Simulate agent making a decision
 */
export async function simulateAgentDecision(): Promise<AgentDecision> {
  await delay(1000);

  const actions: AgentAction[] = ['check_price', 'buy', 'sell', 'hold', 'analyze'];
  const modelIds = ['gpt-4', 'claude-3', 'llama-70b', 'gpt-3.5'];

  const action = actions[Math.floor(Math.random() * actions.length)];
  const modelId = modelIds[Math.floor(Math.random() * modelIds.length)];
  const price = generateMockPrice(modelId);

  let reasoning = '';
  let parameters: Record<string, unknown> | undefined;
  let result: AgentDecision['result'];

  switch (action) {
    case 'check_price':
      reasoning = `Scheduled price check for ${modelId}`;
      result = { success: true, price };
      break;
    case 'buy':
      reasoning = `Price at ${price.toLocaleString()} is attractive. Executing buy order.`;
      parameters = { gas_amount: 2.0 };
      result = {
        success: true,
        tx_hash: `0x${generateId()}${generateId()}`,
        amount: Math.floor((2.0 * 100_000_000) / price * 100_000_000),
      };
      break;
    case 'sell':
      reasoning = `Taking profit on ${modelId} position`;
      parameters = { amount: 100_000_000 };
      result = {
        success: true,
        tx_hash: `0x${generateId()}${generateId()}`,
        amount: 100_000_000,
      };
      break;
    case 'hold':
      reasoning = 'Current position is optimal. No action needed.';
      result = { success: true };
      break;
    case 'analyze':
      reasoning = `Analyzing Q-Score for ${modelId} to evaluate trading opportunity`;
      result = { success: true };
      break;
  }

  const decision: AgentDecision = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    model_id: modelId,
    reasoning,
    parameters,
    result,
  };

  // Add to front of decisions list
  mockDecisions.unshift(decision);

  // Update agent stats
  if (action === 'buy' || action === 'sell') {
    mockAgentStatus.total_trades++;
    if (action === 'buy' && parameters) {
      mockAgentStatus.total_volume += (parameters.gas_amount as number) * 100_000_000;
    }
  }
  mockAgentStatus.last_activity = decision.timestamp;

  return decision;
}

/**
 * Toggle agent status (mock)
 */
export async function toggleAgentStatus(): Promise<AgentStatus> {
  await delay(300);

  mockAgentStatus.status = mockAgentStatus.status === 'active' ? 'idle' : 'active';
  mockAgentStatus.last_activity = new Date().toISOString();

  return { ...mockAgentStatus };
}

export const agentService = {
  getAgentStatus,
  getAgentDecisions,
  simulateAgentDecision,
  toggleAgentStatus,
};
