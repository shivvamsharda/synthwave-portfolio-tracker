
import { useState, useEffect } from "react"
import { TrendingUp, BarChart3, Globe, Wallet } from "lucide-react"

export function DeviceStack() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Main Tablet - World Map View */}
      <div 
        className={`absolute z-30 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-10 rotate-3 opacity-0'
        }`}
        style={{ 
          perspective: '1000px',
          transform: 'rotateX(5deg) rotateY(-10deg)'
        }}
      >
        <div className="w-80 h-56 bg-card border border-border/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Screen Content */}
          <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Global Activity</span>
              </div>
              <div className="text-xs text-muted-foreground">Live</div>
            </div>
            
            {/* World Map Visualization */}
            <div className="relative bg-background/50 rounded-lg h-32 border border-border/10 overflow-hidden">
              {/* Map dots representing crypto activity */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-16 relative">
                  {/* Continents outline */}
                  <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      <path d="M20,15 Q30,10 45,15 Q55,20 65,15 Q75,10 85,15" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                      <path d="M15,25 Q25,30 35,25 Q45,30 55,25" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                      <path d="M10,40 Q20,45 30,40 Q40,45 50,40" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                    </svg>
                  </div>
                  
                  {/* Activity dots */}
                  <div className="absolute top-3 left-8 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute top-6 left-16 w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-4 right-8 w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-6 left-12 w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-4 right-12 w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
              </div>
              
              {/* Teal glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"></div>
            </div>
            
            {/* Stats */}
            <div className="mt-3 flex justify-between text-xs">
              <div>
                <div className="text-primary font-semibold">$2.8M</div>
                <div className="text-muted-foreground">Volume</div>
              </div>
              <div>
                <div className="text-primary font-semibold">1,247</div>
                <div className="text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-success font-semibold">+12.5%</div>
                <div className="text-muted-foreground">24h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Tablet - Analytics */}
      <div 
        className={`absolute z-20 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-10 rotate-6 opacity-0'
        }`}
        style={{ 
          transform: 'rotateX(10deg) rotateY(15deg) translateX(120px) translateY(50px)'
        }}
      >
        <div className="w-64 h-44 bg-card border border-border/20 rounded-xl shadow-xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-background to-primary/5 p-3">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-foreground">Portfolio</span>
            </div>
            
            {/* Chart */}
            <div className="bg-background/50 rounded h-20 border border-border/10 p-2 mb-2">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <polyline
                  points="5,35 15,30 25,32 35,25 45,22 55,18 65,15 75,12 85,8 95,5"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  className="drop-shadow-sm"
                />
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polygon
                  points="5,35 15,30 25,32 35,25 45,22 55,18 65,15 75,12 85,8 95,5 95,40 5,40"
                  fill="url(#chartGradient)"
                />
              </svg>
            </div>
            
            {/* Stats */}
            <div className="flex justify-between text-xs">
              <div>
                <div className="text-foreground font-semibold">$847K</div>
                <div className="text-muted-foreground text-xs">Total</div>
              </div>
              <div className="text-right">
                <div className="text-success font-semibold">+15.7%</div>
                <div className="text-muted-foreground text-xs">Growth</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Device - Wallet View */}
      <div 
        className={`absolute z-10 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-10 rotate-12 opacity-0'
        }`}
        style={{ 
          transform: 'rotateX(15deg) rotateY(-20deg) translateX(-140px) translateY(80px)'
        }}
      >
        <div className="w-36 h-64 bg-card border border-border/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-background to-primary/5 p-3">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-4">
              <Wallet className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-foreground">Wallet</span>
            </div>
            
            {/* Balance */}
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-foreground">$24,680</div>
              <div className="text-xs text-success">+8.2% today</div>
            </div>
            
            {/* Token List */}
            <div className="space-y-2">
              {[
                { symbol: 'BTC', amount: '0.25', value: '$12,340', change: '+5.2%' },
                { symbol: 'ETH', amount: '3.8', value: '$8,940', change: '+12.1%' },
                { symbol: 'SOL', amount: '45.2', value: '$3,400', change: '-2.3%' }
              ].map((token, index) => (
                <div key={index} className="flex justify-between items-center text-xs bg-background/50 rounded p-2">
                  <div>
                    <div className="font-medium text-foreground">{token.symbol}</div>
                    <div className="text-muted-foreground text-xs">{token.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground">{token.value}</div>
                    <div className={`text-xs ${token.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                      {token.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}
