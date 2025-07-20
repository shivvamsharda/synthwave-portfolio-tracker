
import React, { useState, useMemo } from 'react';
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
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Generate realistic portfolio data for the last 24 hours
const generatePortfolioData = () => {
  const data = [];
  const now = new Date();
  const startValue = 2800000; // Starting portfolio value
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Create realistic market movements based on time of day
    let multiplier = 1;
    if (hour >= 9 && hour <= 16) multiplier = 1.02; // Market hours boost
    if (hour >= 0 && hour <= 6) multiplier = 0.98; // Night dip
    
    const randomChange = (Math.random() - 0.5) * 0.04 * multiplier;
    const previousValue = data.length > 0 ? data[data.length - 1].value : startValue;
    const value = previousValue * (1 + randomChange);
    
    data.push({
      time: timestamp.toISOString(),
      value: Math.round(value),
      hour: hour,
      formattedTime: timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{data.formattedTime}</p>
        <p className="text-sm font-semibold text-foreground">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function MobileDashboardPreview() {
  const [selectedRange, setSelectedRange] = useState('24H');
  const chartData = useMemo(() => generatePortfolioData(), []);
  
  // Calculate 24h change
  const startValue = chartData[0]?.value || 0;
  const endValue = chartData[chartData.length - 1]?.value || 0;
  const change24h = endValue - startValue;
  const changePercent = ((change24h / startValue) * 100);

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
            $<CountingNumber target={endValue} />
          </h2>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {changePercent >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-300" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-300" />
            )}
            <span className={`text-sm font-medium ${
              changePercent >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
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

      {/* Real Chart */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Portfolio Chart</h3>
          <Badge variant="secondary" className="text-xs">{selectedRange}</Badge>
        </div>
        
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ 
                  r: 3, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 1
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
