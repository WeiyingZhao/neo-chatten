/**
 * Portfolio Service - Mock API for portfolio and token operations
 */

import { delay, generateId } from '../lib/utils';
import type { TokenInfo, TokenBalance, PortfolioSummary, Transaction, Order } from '../types';
import { MOCK_WALLET_ADDRESS, MOCK_MODELS, BASE_PRICES } from './mockData';

/**
 * Mock portfolio tokens
 */
const mockTokens: TokenInfo[] = [
  {
    token_id: 'token_001',
    owner: MOCK_WALLET_ADDRESS,
    model_id: 'gpt-4',
    q_score: 87,
    compute_units: 500_000_000, // 5.0 tokens
    minted_at: Date.now() - 86400000 * 7,
  },
  {
    token_id: 'token_002',
    owner: MOCK_WALLET_ADDRESS,
    model_id: 'claude-3',
    q_score: 82,
    compute_units: 300_000_000, // 3.0 tokens
    minted_at: Date.now() - 86400000 * 5,
  },
  {
    token_id: 'token_003',
    owner: MOCK_WALLET_ADDRESS,
    model_id: 'llama-70b',
    q_score: 75,
    compute_units: 800_000_000, // 8.0 tokens
    minted_at: Date.now() - 86400000 * 3,
  },
  {
    token_id: 'token_004',
    owner: MOCK_WALLET_ADDRESS,
    model_id: 'gpt-3.5',
    q_score: 78,
    compute_units: 1_200_000_000, // 12.0 tokens
    minted_at: Date.now() - 86400000 * 2,
  },
  {
    token_id: 'token_005',
    owner: MOCK_WALLET_ADDRESS,
    model_id: 'stable-diffusion-xl',
    q_score: 71,
    compute_units: 200_000_000, // 2.0 tokens
    minted_at: Date.now() - 86400000 * 1,
  },
];

/**
 * Mock transaction history
 */
const mockTransactions: Transaction[] = [
  {
    tx_hash: '0x1234567890abcdef1234567890abcdef12345678',
    block_height: 1234567,
    gas_consumed: 0.05,
    state: 'HALT',
    notifications: [],
    type: 'buy',
    model_id: 'gpt-4',
    amount: 200_000_000,
    gas_amount: 2.0,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    to_address: MOCK_WALLET_ADDRESS,
  },
  {
    tx_hash: '0xabcdef1234567890abcdef1234567890abcdef12',
    block_height: 1234560,
    gas_consumed: 0.03,
    state: 'HALT',
    notifications: [],
    type: 'sell',
    model_id: 'gpt-3.5',
    amount: 100_000_000,
    gas_amount: 1.2,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    from_address: MOCK_WALLET_ADDRESS,
  },
  {
    tx_hash: '0x567890abcdef1234567890abcdef1234567890ab',
    block_height: 1234550,
    gas_consumed: 0.04,
    state: 'HALT',
    notifications: [],
    type: 'buy',
    model_id: 'claude-3',
    amount: 300_000_000,
    gas_amount: 2.5,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    to_address: MOCK_WALLET_ADDRESS,
  },
];

/**
 * Get all tokens owned by the wallet
 */
export async function getTokens(): Promise<TokenInfo[]> {
  await delay(200);
  return mockTokens;
}

/**
 * Get token balances grouped by model
 */
export async function getTokenBalances(): Promise<TokenBalance[]> {
  await delay(250);

  const balances: TokenBalance[] = [];

  for (const token of mockTokens) {
    const model = MOCK_MODELS.find(m => m.id === token.model_id);
    const price = BASE_PRICES[token.model_id] || 500000;
    const value = (token.compute_units / 100_000_000) * price;

    balances.push({
      model_id: token.model_id,
      model_name: model?.name || token.model_id,
      balance: token.compute_units / 100_000_000,
      value,
      q_score: token.q_score,
      change_24h: (Math.random() - 0.5) * 10,
    });
  }

  return balances;
}

/**
 * Get portfolio summary
 */
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  await delay(200);

  const balances = await getTokenBalances();
  const totalValue = balances.reduce((sum, b) => sum + b.value, 0);
  const totalTokens = balances.reduce((sum, b) => sum + b.balance, 0);
  const avgQScore = balances.reduce((sum, b) => sum + b.q_score, 0) / balances.length;
  const change24h = (Math.random() - 0.3) * 500000;

  return {
    total_value: totalValue,
    total_tokens: totalTokens,
    avg_q_score: avgQScore,
    change_24h: change24h,
    change_percentage: (change24h / totalValue) * 100,
  };
}

/**
 * Get transaction history
 */
export async function getTransactions(limit: number = 10): Promise<Transaction[]> {
  await delay(200);
  return mockTransactions.slice(0, limit);
}

/**
 * Execute a buy order (mock)
 */
export async function executeBuyOrder(modelId: string, gasAmount: number): Promise<Order> {
  await delay(500);

  const price = BASE_PRICES[modelId] || 500000;
  const amount = (gasAmount * 100_000_000) / price;

  const order: Order = {
    id: generateId(),
    type: 'buy',
    model_id: modelId,
    amount: amount * 100_000_000,
    price,
    total: gasAmount,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };

  // Add to mock transactions
  mockTransactions.unshift({
    tx_hash: `0x${generateId()}${generateId()}`,
    block_height: 1234567 + mockTransactions.length,
    gas_consumed: 0.05,
    state: 'HALT',
    notifications: [],
    type: 'buy',
    model_id: modelId,
    amount: order.amount,
    gas_amount: gasAmount,
    timestamp: order.timestamp,
    to_address: MOCK_WALLET_ADDRESS,
  });

  return order;
}

/**
 * Execute a sell order (mock)
 */
export async function executeSellOrder(modelId: string, amount: number): Promise<Order> {
  await delay(500);

  const price = BASE_PRICES[modelId] || 500000;
  const total = (amount * price) / 100_000_000;

  const order: Order = {
    id: generateId(),
    type: 'sell',
    model_id: modelId,
    amount: amount * 100_000_000,
    price,
    total,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };

  // Add to mock transactions
  mockTransactions.unshift({
    tx_hash: `0x${generateId()}${generateId()}`,
    block_height: 1234567 + mockTransactions.length,
    gas_consumed: 0.03,
    state: 'HALT',
    notifications: [],
    type: 'sell',
    model_id: modelId,
    amount: order.amount,
    gas_amount: total,
    timestamp: order.timestamp,
    from_address: MOCK_WALLET_ADDRESS,
  });

  return order;
}

export const portfolioService = {
  getTokens,
  getTokenBalances,
  getPortfolioSummary,
  getTransactions,
  executeBuyOrder,
  executeSellOrder,
};
