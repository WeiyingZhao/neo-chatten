import { Bell, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { truncateAddress } from '../../lib/utils';
import { MOCK_WALLET_ADDRESS } from '../../services/mockData';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Left side - Breadcrumb / Title would go here */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Network indicator */}
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          TestNet
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            3
          </span>
        </Button>

        {/* Wallet */}
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline font-mono text-sm">
            {truncateAddress(MOCK_WALLET_ADDRESS)}
          </span>
        </Button>
      </div>
    </header>
  );
}
