import React from 'react';
import { AnimatedLineChart, AnimatedBarChart, CircularProgress, CountingNumber } from './AnimatedChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  DollarSign,
  BarChart3,
  PieChart,
  Users,
  Globe,
  Settings,
  Bell,
  Search,
  Home,
  Menu,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter
} from 'lucide-react';

export function DashboardPreview() {
  const areaChartData = [
    { time: '00:00', value: 2400 },
    { time: '04:00', value: 1800 },
    { time: '08:00', value: 3200 },
    { time: '12:00', value: 2800 },
    { time: '16:00', value: 4200 },
    { time: '20:00', value: 3600 },
    { time: '24:00', value: 4800 }
  ];

  const transactionData = [
    { address: '7xKs...9mNp', type: 'Swap', amount: '+$2,847.32', token: 'SOL → USDC', time: '2 min ago', status: 'success' },
    { address: 'Bq8x...4kLm', type: 'Transfer', amount: '-$1,205.88', token: 'ETH', time: '5 min ago', status: 'pending' },
    { address: '9nVx...7tRz', type: 'Stake', amount: '+$892.15', token: 'MATIC', time: '8 min ago', status: 'success' },
    { address: 'F2pL...3wQx', type: 'Yield', amount: '+$156.42', token: 'AAVE', time: '12 min ago', status: 'success' }
  ];
  
  return (
    <div className="relative w-full max-w-6xl mx-auto bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Main Dashboard Interface */}
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          {/* Logo & Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Neptune</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-primary/10 text-primary rounded-lg">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Portfolio</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Trading</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer">
              <PieChart className="w-4 h-4" />
              <span className="text-sm">DeFi</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer">
              <Users className="w-4 h-4" />
              <span className="text-sm">Community</span>
            </div>
          </div>
          
          {/* Integrations Section */}
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Integrations</p>
            <div className="space-y-2">
              {[
                { name: 'Bitquery', color: 'bg-blue-500' },
                { name: 'Raydium', color: 'bg-purple-500' },
                { name: 'Jupiter', color: 'bg-green-500' },
                { name: 'Helio', color: 'bg-orange-500' },
                { name: 'Meteora', color: 'bg-pink-500' }
              ].map((integration, i) => (
                <div key={i} className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted/30">
                  <div className={`w-2 h-2 rounded-full ${integration.color}`}></div>
                  <span className="text-xs text-muted-foreground">{integration.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-white">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Alex Chen</p>
                <p className="text-xs text-muted-foreground">Premium</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-16 border-b border-border px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-muted rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Wallets</span>
                  <Wallet className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-foreground">
                    <CountingNumber target={9234} />
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+5.7%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Protocols</span>
                  <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-foreground">
                    <CountingNumber target={4123} />
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+17%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">New Traders</span>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-foreground">
                    <CountingNumber target={123} />
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+955%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Traders</span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-foreground">
                    <CountingNumber target={2135} />
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+83%</span>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-6">
              {/* Main Chart */}
              <Card className="col-span-2 p-6 border-border bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Trading Volume</h3>
                    <p className="text-sm text-muted-foreground">DEX trading activity</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md">24H</button>
                    <button className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">7D</button>
                    <button className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">30D</button>
                  </div>
                </div>
                <div className="h-48">
                  <svg viewBox="0 0 600 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.0 }} />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line 
                        key={i} 
                        x1="0" 
                        y1={i * 50} 
                        x2="600" 
                        y2={i * 50} 
                        stroke="hsl(var(--border))" 
                        strokeWidth="1" 
                        opacity="0.2"
                      />
                    ))}
                    
                    {/* Area Path */}
                    <path
                      d="M0,120 Q100,80 150,100 T300,90 Q400,70 450,85 T600,60 L600,200 L0,200 Z"
                      fill="url(#portfolioGradient)"
                      className="animate-fade-in"
                    />
                    
                    {/* Line Path */}
                    <path
                      d="M0,120 Q100,80 150,100 T300,90 Q400,70 450,85 T600,60"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                      className="animate-fade-in"
                    />
                    
                    {/* Data Points */}
                    {[0, 150, 300, 450, 600].map((x, i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={[120, 100, 90, 85, 60][i]}
                        r="4"
                        fill="hsl(var(--primary))"
                        className="animate-scale-in"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </svg>
                </div>
              </Card>
              
              {/* Donut Chart */}
              <Card className="p-6 border-border bg-card">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Protocol Distribution</h3>
                  <p className="text-sm text-muted-foreground">Usage across DeFi protocols</p>
                </div>
                <div className="relative flex items-center justify-center mb-4">
                  <CircularProgress percentage={75} size={120} strokeWidth={8} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">75%</div>
                      <div className="text-xs text-muted-foreground">Diversified</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Raydium</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Jupiter</span>
                    </div>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Meteora</span>
                    </div>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Others</span>
                    </div>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Transaction Table */}
            <Card className="border-border bg-card">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
                    <p className="text-sm text-muted-foreground">Recent trading activity</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                    <Eye className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Address</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Token</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData.map((tx, index) => (
                      <tr 
                        key={index} 
                        className="border-t border-border hover:bg-muted/20 transition-colors animate-slide-in-right"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-4">
                          <span className="text-sm font-mono text-foreground">{tx.address}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">{tx.type}</Badge>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-medium ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.amount}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{tx.token}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{tx.time}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${tx.status === 'success' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-sm text-muted-foreground capitalize">{tx.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
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