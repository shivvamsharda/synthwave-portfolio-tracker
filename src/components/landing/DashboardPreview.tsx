import React from 'react';
import { AnimatedLineChart, CircularProgress, CountingNumber } from './AnimatedChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, Activity, DollarSign } from 'lucide-react';

export function DashboardPreview() {
  const portfolioData = [320, 450, 280, 680, 920, 1100, 890, 1200, 1450, 1680, 1920, 2100];
  const tradingData = [45, 52, 38, 61, 73, 69, 82, 95, 108, 89, 124, 135];
  
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main Dashboard Card */}
      <div className="web3-card p-6 space-y-6 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Portfolio Overview</h3>
            <p className="text-sm text-muted-foreground">Real-time analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-500">Live</span>
          </div>
        </div>
        
        {/* Total Value */}
        <div className="space-y-2">
          <div className="flex items-end space-x-3">
            <span className="metric-large">
              $<CountingNumber target={2847329} prefix="" suffix="" />
            </span>
            <div className="flex items-center space-x-1 pb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">+12.5%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
        </div>
        
        {/* Chart */}
        <div className="h-20 w-full">
          <AnimatedLineChart 
            data={portfolioData} 
            color="hsl(var(--primary))"
            height={80}
          />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Assets</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              <CountingNumber target={247} />
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">24h Volume</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              $<CountingNumber target={1834} />K
            </span>
          </div>
        </div>
      </div>
      
      {/* Floating Cards */}
      <div className="absolute -right-4 -top-4 w-32">
        <Card className="web3-card p-3 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">SOL</span>
            <TrendingUp className="w-3 h-3 text-green-500" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-bold text-foreground">$<CountingNumber target={142} /></span>
            <div className="h-6">
              <AnimatedLineChart 
                data={[100, 105, 98, 110, 118, 142]} 
                color="hsl(var(--success))"
                height={24}
              />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="absolute -left-6 top-16 w-28">
        <Card className="web3-card p-3 animate-float" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-center mb-2">
            <CircularProgress percentage={78} size={40} strokeWidth={4} />
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Portfolio Health</span>
          </div>
        </Card>
      </div>
      
      <div className="absolute -right-8 bottom-8 w-36">
        <Card className="web3-card p-3 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Active Trades</span>
            <Badge variant="secondary" className="text-xs">Live</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">ETH/USDC</span>
              <span className="text-green-500">+2.4%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">BTC/SOL</span>
              <span className="text-red-500">-1.1%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">MATIC/USDT</span>
              <span className="text-green-500">+5.7%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function MessagingPreview() {
  const messages = [
    { user: 'Alex Chen', message: 'Portfolio update available', time: '2m', avatar: '👤' },
    { user: 'Sarah Kim', message: 'New whale activity detected', time: '5m', avatar: '👩' },
    { user: 'Bot Alert', message: 'Price target reached for SOL', time: '8m', avatar: '🤖' },
  ];
  
  return (
    <div className="web3-card p-4 max-w-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Real-time Notifications</h3>
        <Badge variant="secondary" className="text-xs animate-pulse-glow">3 New</Badge>
      </div>
      
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className="flex items-start space-x-3 animate-slide-in-right"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs">
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate">{msg.user}</span>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}