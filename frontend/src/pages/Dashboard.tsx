import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity, Gauge, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatGas, formatPercentage, formatCompact, formatRelativeTime } from '../lib/utils';
import { portfolioService, marketService, agentService } from '../services';
import type { PortfolioSummary, MarketAnalysis, AgentDecision, PriceData } from '../types';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="mt-1 flex items-center gap-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                <span
                  className={
                    trend === 'up'
                      ? 'text-sm text-success'
                      : trend === 'down'
                      ? 'text-sm text-destructive'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {formatPercentage(change)}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [agentDecisions, setAgentDecisions] = useState<AgentDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [portfolioData, marketData, pricesData, agentData] = await Promise.all([
          portfolioService.getPortfolioSummary(),
          marketService.getMarketAnalysis(),
          marketService.getAllPrices(),
          agentService.getAgentDecisions(5),
        ]);
        setPortfolio(portfolioData);
        setMarket(marketData);
        setPrices(pricesData.slice(0, 5));
        setAgentDecisions(agentData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Portfolio Value"
          value={`${formatCompact(portfolio?.total_value || 0)} GAS`}
          change={portfolio?.change_percentage || 0}
          icon={Wallet}
          trend={portfolio?.change_percentage && portfolio.change_percentage >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Total Tokens"
          value={portfolio?.total_tokens.toFixed(2) || '0'}
          icon={Activity}
        />
        <StatsCard
          title="Avg Q-Score"
          value={portfolio?.avg_q_score.toFixed(1) || '0'}
          icon={Gauge}
        />
        <StatsCard
          title="Market Trend"
          value={market?.price_trend === 'up' ? 'Bullish' : market?.price_trend === 'down' ? 'Bearish' : 'Stable'}
          icon={market?.price_trend === 'up' ? TrendingUp : TrendingDown}
          trend={market?.price_trend === 'up' ? 'up' : market?.price_trend === 'down' ? 'down' : 'neutral'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Models */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Models</CardTitle>
            <Link to="/market">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prices.map((price) => (
                <div
                  key={price.model_id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{price.model_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatGas(price.price)} GAS
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={price.change_percentage >= 0 ? 'success' : 'destructive'}
                    >
                      {formatPercentage(price.change_percentage)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Agent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agent Activity</CardTitle>
            <Link to="/agent">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${
                      decision.result?.success ? 'bg-success' : 'bg-destructive'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase">
                        {decision.action}
                      </Badge>
                      <span className="text-sm font-medium">{decision.model_id}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {decision.reasoning}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(decision.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/trading">
              <Button>Buy Compute</Button>
            </Link>
            <Link to="/trading">
              <Button variant="outline">Sell Compute</Button>
            </Link>
            <Link to="/qscore">
              <Button variant="outline">Analyze Q-Score</Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="outline">View Portfolio</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
