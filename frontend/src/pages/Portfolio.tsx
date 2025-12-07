import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Coins, Gauge, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatGas, formatPercentage } from '../lib/utils';
import { portfolioService, marketService } from '../services';
import type { TokenBalance, PortfolioSummary, AIModel } from '../types';

export function Portfolio() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, balancesData, modelsData] = await Promise.all([
        portfolioService.getPortfolioSummary(),
        portfolioService.getTokenBalances(),
        marketService.getModels(),
      ]);
      setSummary(summaryData);
      setBalances(balancesData);
      setModels(modelsData);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Calculate allocation percentages
  const totalValue = summary?.total_value || 1;
  const allocations = balances.map((b) => ({
    ...b,
    percentage: (b.value / totalValue) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatGas(summary?.total_value || 0)} GAS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-xl font-bold">{summary?.total_tokens.toFixed(2) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Q-Score</p>
                <p className="text-xl font-bold">{summary?.avg_q_score.toFixed(1) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  (summary?.change_percentage || 0) >= 0
                    ? 'bg-success/10'
                    : 'bg-destructive/10'
                }`}
              >
                {(summary?.change_percentage || 0) >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p
                  className={`text-xl font-bold ${
                    (summary?.change_percentage || 0) >= 0
                      ? 'text-success'
                      : 'text-destructive'
                  }`}
                >
                  {formatPercentage(summary?.change_percentage || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Token Balances */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Token Balances</CardTitle>
            <Button variant="outline" size="icon" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balances.map((balance) => {
                const model = models.find((m) => m.id === balance.model_id);
                return (
                  <div
                    key={balance.model_id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {balance.model_id.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{model?.name || balance.model_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Q-Score: {balance.q_score}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium font-mono">
                        {balance.balance.toFixed(4)} COMPUTE
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {formatGas(balance.value, 2)} GAS
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={balance.change_24h >= 0 ? 'success' : 'destructive'}
                      >
                        {formatPercentage(balance.change_24h)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocations.map((allocation, index) => {
                const colors = [
                  'bg-primary',
                  'bg-accent-cyan',
                  'bg-accent-purple',
                  'bg-success',
                  'bg-warning',
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={allocation.model_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${color}`} />
                        <span>{allocation.model_name}</span>
                      </div>
                      <span className="font-medium">{allocation.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${allocation.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Positions</span>
                <span className="font-medium">{balances.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
