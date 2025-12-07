/**
 * Agent Types - Types for AI agent activity tracking
 */

/**
 * Agent action types.
 */
export type AgentAction = 'check_price' | 'buy' | 'sell' | 'hold' | 'analyze';

/**
 * Agent decision record.
 */
export interface AgentDecision {
  id: string;
  timestamp: string;
  action: AgentAction;
  model_id: string;
  reasoning: string;
  parameters?: Record<string, unknown>;
  result?: {
    success: boolean;
    tx_hash?: string;
    error?: string;
    price?: number;
    amount?: number;
  };
}

/**
 * Agent status.
 */
export interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'error';
  last_activity: string;
  total_trades: number;
  success_rate: number;
  total_volume: number;
  profit_loss: number;
}

/**
 * Agent configuration.
 */
export interface AgentConfig {
  name: string;
  target_model: string;
  buy_threshold: number;
  sell_threshold: number;
  max_position: number;
  enabled: boolean;
}
