/**
 * Token Types - Mirrors Python backend dataclasses from tools/token_tools.py
 */

/**
 * Information about a Compute Token.
 * Mirrors Python TokenInfo dataclass.
 */
export interface TokenInfo {
  token_id: string;
  owner: string;
  model_id: string;
  q_score: number;
  compute_units: number;
  minted_at: number;
}

/**
 * Transaction notification from contract events.
 */
export interface TransactionNotification {
  contract: string;
  event_name: string;
  state: Record<string, unknown>;
}

/**
 * Result of a Neo N3 transaction.
 * Mirrors Python TransactionResult dataclass.
 */
export interface TransactionResult {
  tx_hash: string;
  block_height: number | null;
  gas_consumed: number;
  state: 'NONE' | 'HALT' | 'FAULT';
  notifications: TransactionNotification[];
}

/**
 * Extended transaction for UI display.
 */
export interface Transaction extends TransactionResult {
  type: 'buy' | 'sell' | 'transfer' | 'mint' | 'burn';
  model_id: string;
  amount: number;
  gas_amount?: number;
  timestamp: string;
  from_address?: string;
  to_address?: string;
}

/**
 * Order for trading.
 */
export interface Order {
  id: string;
  type: 'buy' | 'sell';
  model_id: string;
  amount: number;
  price: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  timestamp: string;
}

/**
 * Portfolio summary.
 */
export interface PortfolioSummary {
  total_value: number;
  total_tokens: number;
  avg_q_score: number;
  change_24h: number;
  change_percentage: number;
}

/**
 * Token balance by model.
 */
export interface TokenBalance {
  model_id: string;
  model_name: string;
  balance: number;
  value: number;
  q_score: number;
  change_24h: number;
}
