import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  BarChart3,
  Bell,
  Menu,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { CountingNumber } from './AnimatedChart';

export function MobileDashboardPreview() {
  return (
    <div className="w-full max-w-sm mx-auto bg-card border border-border/30 rounded-3xl overflow-hidden shadow-2xl">
      {/* Mobile Header */}
      <div className="bg-gradient-primary p-4">
        <div className="flex items-center justify-between mb-4">
          <Menu className="w-6 h-6 text-white" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">Neptune</span>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Portfolio Value */}
        <div className="text-center text-white">
          <p className="text-sm opacity-80">Total Portfolio</p>
          <h2 className="text-3xl font-bold">
            $<CountingNumber target={2847329} />
          </h2>
          <div className="flex items-center justify-center space-x-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-green-300 text-sm font-medium">+12.5%</span>
            <span className="text-white/70 text-sm">24h</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-muted/30">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-lg font-bold text-foreground">
              <CountingNumber target={7} />
            </p>
            <p className="text-xs text-muted-foreground">Wallets</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-foreground">
              <CountingNumber target={24} />
            </p>
            <p className="text-xs text-muted-foreground">Tokens</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-bold text-foreground">
              <CountingNumber target={156} />
            </p>
            <p className="text-xs text-muted-foreground">Trades</p>
          </div>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Top Holdings</h3>
          <span className="text-xs text-primary cursor-pointer">View All</span>
        </div>
        
        <div className="space-y-3">
          {[
            { symbol: 'SOL', name: 'Solana', value: '$1,234.56', change: '+5.2%', color: 'bg-purple-500' },
            { symbol: 'BONK', name: 'Bonk', value: '$892.34', change: '+12.8%', color: 'bg-orange-500' },
            { symbol: 'RAY', name: 'Raydium', value: '$567.89', change: '-2.1%', color: 'bg-blue-500' }
          ].map((token, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-card border border-border/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${token.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{token.symbol.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">{token.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-foreground text-sm">{token.value}</p>
                <div className="flex items-center space-x-1">
                  {token.change.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    token.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {token.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Preview */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Portfolio Chart</h3>
          <Badge variant="secondary" className="text-xs">24H</Badge>
        </div>
        
        <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg flex items-end justify-center p-2">
          {[40, 65, 45, 80, 70, 90, 75, 85].map((height, i) => (
            <div
              key={i}
              className="bg-primary/60 w-3 mx-0.5 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-between items-center">
          {[
            { icon: Wallet, label: 'Portfolio', active: true },
            { icon: BarChart3, label: 'Analytics', active: false },
            { icon: Activity, label: 'Trading', active: false },
            { icon: Search, label: 'Explore', active: false }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col items-center space-y-1 ${
              item.active ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}