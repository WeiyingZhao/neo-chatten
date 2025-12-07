import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Gauge,
  Wallet,
  History,
  Bot,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/market', icon: TrendingUp, label: 'Market' },
  { to: '/trading', icon: ArrowLeftRight, label: 'Trading' },
  { to: '/qscore', icon: Gauge, label: 'Q-Score' },
  { to: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/agent', icon: Bot, label: 'Agent' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">Chatten</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-background-elevated hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-background-elevated hover:text-foreground'
              )
            }
          >
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
