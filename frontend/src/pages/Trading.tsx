import { useEffect, useState } from 'react';
import { ArrowRightLeft, TrendingUp, TrendingDown, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { formatGas, formatPercentage, formatRelativeTime } from '../lib/utils';
import { marketService, portfolioService } from '../services';
import type { PriceData, AIModel, Order, Transaction } from '../types';

export function Trading() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelsData, pricesData, txData] = await Promise.all([
          marketService.getModels(),
          marketService.getAllPrices(),
          portfolioService.getTransactions(5),
        ]);
        setModels(modelsData);
        setPrices(pricesData);
        setTransactions(txData);
      } catch (error) {
        console.error('Failed to load trading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedPrice = prices.find((p) => p.model_id === selectedModel);

  async function handleSubmitOrder() {
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      let order: Order;
      if (orderType === 'buy') {
        order = await portfolioService.executeBuyOrder(selectedModel, parseFloat(amount));
      } else {
        order = await portfolioService.executeSellOrder(selectedModel, parseFloat(amount));
      }
      setLastOrder(order);
      setAmount('');

      // Refresh transactions
      const txData = await portfolioService.getTransactions(5);
      setTransactions(txData);
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setSubmitting(false);
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Trade Compute
            </CardTitle>
            <CardDescription>Buy or sell compute credits</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="data-[state=active]:bg-success/20 data-[state=active]:text-success">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
                  Sell
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Select Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-foreground"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount (GAS)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>

                {selectedPrice && amount && (
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span>{formatGas(selectedPrice.price)} GAS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You will receive</span>
                      <span className="font-medium">
                        ~{((parseFloat(amount) * 100_000_000) / selectedPrice.price).toFixed(4)} COMPUTE
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee (0.3%)</span>
                      <span>{(parseFloat(amount) * 0.003).toFixed(4)} GAS</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-success hover:bg-success/90"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !amount || parseFloat(amount) <= 0}
                >
                  {submitting ? 'Processing...' : 'Buy Compute'}
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Select Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-foreground"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount (COMPUTE)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>

                {selectedPrice && amount && (
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span>{formatGas(selectedPrice.price)} GAS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You will receive</span>
                      <span className="font-medium">
                        ~{((parseFloat(amount) * selectedPrice.price) / 100_000_000).toFixed(4)} GAS
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee (0.3%)</span>
                      <span>
                        {(((parseFloat(amount) * selectedPrice.price) / 100_000_000) * 0.003).toFixed(4)} GAS
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-destructive hover:bg-destructive/90"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !amount || parseFloat(amount) <= 0}
                >
                  {submitting ? 'Processing...' : 'Sell Compute'}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Last Order Result */}
            {lastOrder && (
              <div
                className={`mt-4 rounded-lg border p-3 ${
                  lastOrder.status === 'completed'
                    ? 'border-success/50 bg-success/5'
                    : 'border-destructive/50 bg-destructive/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {lastOrder.status === 'completed' ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {lastOrder.status === 'completed' ? 'Order Completed' : 'Order Failed'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lastOrder.type === 'buy' ? 'Bought' : 'Sold'}{' '}
                  {(lastOrder.amount / 100_000_000).toFixed(4)} COMPUTE
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Cards */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {prices.slice(0, 6).map((price) => {
                const model = models.find((m) => m.id === price.model_id);
                return (
                  <div
                    key={price.model_id}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedModel === price.model_id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-background-elevated'
                    }`}
                    onClick={() => setSelectedModel(price.model_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{model?.name || price.model_id}</p>
                        <p className="text-lg font-bold font-mono">
                          {formatGas(price.price)} GAS
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={price.change_percentage >= 0 ? 'success' : 'destructive'}
                        >
                          {price.change_percentage >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {formatPercentage(price.change_percentage)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.tx_hash}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      tx.type === 'buy'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {tx.type === 'buy' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type} {tx.model_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium font-mono">
                    {(tx.amount / 100_000_000).toFixed(4)} COMPUTE
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tx.gas_amount?.toFixed(2)} GAS
                  </p>
                </div>
                <Badge variant={tx.state === 'HALT' ? 'success' : 'destructive'}>
                  {tx.state === 'HALT' ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
