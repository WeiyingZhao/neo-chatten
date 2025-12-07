import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatRelativeTime, truncateTxHash } from '../lib/utils';
import { portfolioService } from '../services';
import type { Transaction } from '../types';

type FilterType = 'all' | 'buy' | 'sell' | 'transfer';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const txData = await portfolioService.getTransactions(50);
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const stats = {
    total: transactions.length,
    buys: transactions.filter((t) => t.type === 'buy').length,
    sells: transactions.filter((t) => t.type === 'sell').length,
    transfers: transactions.filter((t) => t.type === 'transfer').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Buy Orders</p>
            <p className="text-2xl font-bold text-success">{stats.buys}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sell Orders</p>
            <p className="text-2xl font-bold text-destructive">{stats.sells}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transfers</p>
            <p className="text-2xl font-bold">{stats.transfers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>
            </Tabs>
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
          ) : filteredTransactions.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Filter className="h-12 w-12 mb-4" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.tx_hash}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-background-elevated"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.type === 'buy'
                          ? 'bg-success/10'
                          : tx.type === 'sell'
                          ? 'bg-destructive/10'
                          : 'bg-primary/10'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <ArrowDownLeft className="h-5 w-5 text-success" />
                      ) : tx.type === 'sell' ? (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{tx.type}</p>
                        <Badge variant="outline">{tx.model_id}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{truncateTxHash(tx.tx_hash)}</span>
                        <a
                          href={`https://testnet.explorer.onegate.space/transactionInfo/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium font-mono">
                      {(tx.amount / 100_000_000).toFixed(4)} COMPUTE
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">GAS</p>
                    <p className="font-medium font-mono">
                      {tx.gas_amount?.toFixed(4) || '0'} GAS
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Block</p>
                    <p className="font-medium font-mono">
                      {tx.block_height?.toLocaleString() || '-'}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge variant={tx.state === 'HALT' ? 'success' : 'destructive'}>
                      {tx.state === 'HALT' ? 'Success' : 'Failed'}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(tx.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
