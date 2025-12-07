import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { MOCK_WALLET_ADDRESS } from '../services/mockData';

export function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Wallet Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Configuration</CardTitle>
          <CardDescription>Manage your Neo N3 wallet connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Connected Wallet</label>
            <div className="flex items-center gap-3">
              <Input
                value={MOCK_WALLET_ADDRESS}
                readOnly
                className="font-mono"
              />
              <Badge variant="success">Connected</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Network</label>
            <div className="flex items-center gap-3">
              <Input value="Neo N3 TestNet" readOnly />
              <Badge variant="outline">TestNet</Badge>
            </div>
          </div>

          <Button variant="outline">Disconnect Wallet</Button>
        </CardContent>
      </Card>

      {/* Contract Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Configuration</CardTitle>
          <CardDescription>Chatten token contract settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Contract Hash</label>
            <Input
              value="0x1234567890abcdef1234567890abcdef12345678"
              readOnly
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Token Symbol</label>
              <Input value="COMPUTE" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Decimals</label>
              <Input value="8" readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Trading agent parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Buy Threshold (GAS)</label>
              <Input type="number" defaultValue="1000000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Default Buy Amount (GAS)</label>
              <Input type="number" defaultValue="2.0" step="0.1" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Target Model</label>
            <Input value="gpt-4" />
          </div>

          <Button>Save Agent Settings</Button>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize the dashboard appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Badge>Always On</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Refresh Interval</p>
              <p className="text-sm text-muted-foreground">Auto-refresh data every</p>
            </div>
            <select className="rounded-md border border-border bg-background-elevated px-3 py-2">
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="0">Manual only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Chatten Dashboard</strong> v1.0.0</p>
          <p>Decentralized Exchange for AI Compute Tokens on Neo N3</p>
          <p className="pt-2">
            Built with React, TypeScript, and Tailwind CSS.
            <br />
            Powered by Neo N3 blockchain and SpoonOS agent framework.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
