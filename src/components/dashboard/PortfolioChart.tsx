import { DashboardCard } from "@/components/ui/dashboard-card"
import { TrendingUp, TrendingDown } from "lucide-react"

// Mock chart data - would be replaced with real chart library like Recharts
const generateMockData = () => {
  const data = []
  const now = Date.now()
  for (let i = 0; i < 24; i++) {
    data.push({
      time: now - (23 - i) * 60 * 60 * 1000,
      value: 127000 + Math.random() * 10000 - 5000 + i * 200
    })
  }
  return data
}

export function PortfolioChart() {
  const data = generateMockData()
  const currentValue = data[data.length - 1].value
  const previousValue = data[data.length - 2].value
  const change = currentValue - previousValue
  const changePercent = (change / previousValue) * 100

  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Portfolio Value</h3>
          <p className="text-3xl font-bold text-primary">
            ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${
              change >= 0 ? "status-positive" : "status-negative"
            }`}>
              {change >= 0 ? "+" : ""}${change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md font-medium">
            24H
          </button>
          <button className="px-3 py-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            7D
          </button>
          <button className="px-3 py-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            30D
          </button>
        </div>
      </div>

      {/* Mock Chart Visualization */}
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={data.map((point, index) => 
              `${(index / (data.length - 1)) * 800},${200 - ((point.value - 120000) / 15000) * 200}`
            ).join(' ')}
            className="drop-shadow-sm"
            style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.6))' }}
          />
          
          {/* Chart area fill */}
          <polygon
            fill="url(#chartGradient)"
            points={[
              ...data.map((point, index) => 
                `${(index / (data.length - 1)) * 800},${200 - ((point.value - 120000) / 15000) * 200}`
              ),
              '800,200',
              '0,200'
            ].join(' ')}
          />
        </svg>
        
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute w-full border-t border-border/30"
              style={{ top: `${i * 25}%` }}
            />
          ))}
        </div>
      </div>
    </DashboardCard>
  )
}