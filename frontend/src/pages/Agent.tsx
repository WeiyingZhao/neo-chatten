import { useEffect, useState } from 'react';
import { Bot, Play, Pause, CheckCircle, XCircle, Clock, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatGas, formatPercentage, formatRelativeTime } from '../lib/utils';
import { agentService } from '../services';
import type { AgentStatus, AgentDecision } from '../types';

const actionIcons: Record<string, React.ElementType> = {
  check_price: Clock,
  buy: TrendingUp,
  sell: TrendingUp,
  hold: Activity,
  analyze: Activity,
};

const actionColors: Record<string, string> = {
  check_price: 'bg-blue-500/10 text-blue-500',
  buy: 'bg-success/10 text-success',
  sell: 'bg-destructive/10 text-destructive',
  hold: 'bg-muted text-muted-foreground',
  analyze: 'bg-primary/10 text-primary',
};

export function Agent() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [simulating, setSimulating] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [statusData, decisionsData] = await Promise.all([
        agentService.getAgentStatus(),
        agentService.getAgentDecisions(20),
      ]);
      setStatus(statusData);
      setDecisions(decisionsData);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleAgent() {
    setToggling(true);
    try {
      const newStatus = await agentService.toggleAgentStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    } finally {
      setToggling(false);
    }
  }

  async function handleSimulateDecision() {
    setSimulating(true);
    try {
      const newDecision = await agentService.simulateAgentDecision();
      setDecisions((prev) => [newDecision, ...prev]);
      const newStatus = await agentService.getAgentStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to simulate decision:', error);
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  status?.status === 'active'
                    ? 'bg-success/10'
                    : status?.status === 'error'
                    ? 'bg-destructive/10'
                    : 'bg-muted'
                }`}
              >
                <Bot
                  className={`h-6 w-6 ${
                    status?.status === 'active'
                      ? 'text-success'
                      : status?.status === 'error'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
              <div>
                <CardTitle>{status?.name || 'ChattenTrader'}</CardTitle>
                <CardDescription>Autonomous AI Trading Agent</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  status?.status === 'active'
                    ? 'success'
                    : status?.status === 'error'
                    ? 'destructive'
                    : 'secondary'
                }
                className="capitalize"
              >
                {status?.status === 'active' && (
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-current animate-pulse" />
                )}
                {status?.status}
              </Badge>
              <Button
                variant={status?.status === 'active' ? 'destructive' : 'default'}
                onClick={handleToggleAgent}
                disabled={toggling}
              >
                {status?.status === 'active' ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Agent
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{status?.total_trades || 0}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-success">
                {formatPercentage((status?.success_rate || 0) * 100 - 100)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">
                {formatGas(status?.total_volume || 0)} GAS
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">P&L</p>
              <p
                className={`text-2xl font-bold ${
                  (status?.profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {(status?.profit_loss || 0) >= 0 ? '+' : ''}
                {formatGas(status?.profit_loss || 0)} GAS
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Controls</CardTitle>
          <CardDescription>
            Simulate agent decisions for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handleSimulateDecision} disabled={simulating}>
            {simulating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Simulate Decision
              </>
            )}
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>
            Recent agent decisions and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {decisions.map((decision) => {
              const Icon = actionIcons[decision.action] || Activity;
              const colorClass = actionColors[decision.action] || 'bg-muted text-muted-foreground';

              return (
                <div
                  key={decision.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="uppercase text-xs">
                        {decision.action.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">{decision.model_id}</Badge>
                      {decision.result?.success ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {decision.reasoning}
                    </p>
                    {decision.result && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {decision.result.price && (
                          <span>Price: {formatGas(decision.result.price)} GAS</span>
                        )}
                        {decision.result.amount && (
                          <span>
                            Amount: {(decision.result.amount / 100_000_000).toFixed(4)} COMPUTE
                          </span>
                        )}
                        {decision.result.tx_hash && (
                          <span className="font-mono">
                            TX: {decision.result.tx_hash.slice(0, 10)}...
                          </span>
                        )}
                        {decision.result.error && (
                          <span className="text-destructive">
                            Error: {decision.result.error}
                          </span>
                        )}
                      </div>
                    )}
                    {decision.parameters && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Params: {JSON.stringify(decision.parameters)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(decision.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
