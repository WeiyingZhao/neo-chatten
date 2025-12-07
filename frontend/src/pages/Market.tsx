import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatGas, formatPercentage, formatCompact } from '../lib/utils';
import { marketService } from '../services';
import type { PriceData, MarketAnalysis, AIModel } from '../types';

export function Market() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [pricesData, modelsData, marketData] = await Promise.all([
        marketService.getAllPrices(),
        marketService.getModels(),
        marketService.getMarketAnalysis(),
      ]);
      setPrices(pricesData);
      setModels(modelsData);
      setMarket(marketData);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrices = prices.filter((price) => {
    const model = models.find((m) => m.id === price.model_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      price.model_id.toLowerCase().includes(searchLower) ||
      model?.name.toLowerCase().includes(searchLower) ||
      model?.provider.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Models</p>
            <p className="text-2xl font-bold">{market?.total_models || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Q-Score</p>
            <p className="text-2xl font-bold">{market?.avg_q_score.toFixed(1) || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Market Liquidity</p>
            <p className="text-2xl font-bold">{formatCompact(market?.market_liquidity || 0)} GAS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Market Trend</p>
            <div className="flex items-center gap-2">
              {market?.price_trend === 'up' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-success">Bullish</span>
                </>
              ) : market?.price_trend === 'down' ? (
                <>
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">Bearish</span>
                </>
              ) : (
                <span className="text-2xl font-bold">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Model Prices</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Model</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Provider</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">24h Change</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">24h Volume</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">24h High/Low</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((price) => {
                    const model = models.find((m) => m.id === price.model_id);
                    return (
                      <tr
                        key={price.model_id}
                        className="border-b border-border/50 hover:bg-background-elevated"
                      >
                        <td className="py-4">
                          <div className="font-medium">{model?.name || price.model_id}</div>
                          <div className="text-sm text-muted-foreground">{price.model_id}</div>
                        </td>
                        <td className="py-4 text-muted-foreground">{model?.provider || 'Unknown'}</td>
                        <td className="py-4">
                          <Badge variant="outline" className="capitalize">
                            {model?.category.replace('_', ' ') || 'unknown'}
                          </Badge>
                        </td>
                        <td className="py-4 text-right font-mono">
                          {formatGas(price.price)} GAS
                        </td>
                        <td className="py-4 text-right">
                          <Badge
                            variant={price.change_percentage >= 0 ? 'success' : 'destructive'}
                          >
                            {formatPercentage(price.change_percentage)}
                          </Badge>
                        </td>
                        <td className="py-4 text-right font-mono text-muted-foreground">
                          {formatCompact(price.volume_24h)} GAS
                        </td>
                        <td className="py-4 text-right text-sm text-muted-foreground">
                          <span className="text-success">{formatGas(price.high_24h)}</span>
                          {' / '}
                          <span className="text-destructive">{formatGas(price.low_24h)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
