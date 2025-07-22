
import { DashboardCard } from "@/components/ui/dashboard-card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { usePortfolioChart } from "@/hooks/usePortfolioChart"
import { usePortfolioStats } from "@/hooks/usePortfolioStats"
import { usePortfolio } from "@/hooks/usePortfolio"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useState, useEffect, useCallback } from "react"

const timeRanges = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 }
]

// Debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function PortfolioChart() {
  const [selectedRange, setSelectedRange] = useState(30)
  const { chartData, loading: chartLoading, refreshChartData } = usePortfolioChart(selectedRange)
  const { stats, loading: statsLoading, refreshStats } = usePortfolioStats()
  const { portfolio, portfolioStats } = usePortfolio()

  // Debounced refresh functions for manual refresh only
  const debouncedChartRefresh = useCallback(
    debounce(() => {
      console.log('[PortfolioChart] Manual chart refresh triggered (debounced)')
      refreshChartData()
    }, 1500),
    [refreshChartData]
  )

  const debouncedStatsRefresh = useCallback(
    debounce(() => {
      console.log('[PortfolioChart] Manual stats refresh triggered (debounced)')
      refreshStats()
    }, 2000),
    [refreshStats]
  )

  // ONLY refresh when explicitly requested via manual portfolio update
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('[PortfolioChart] Manual portfolio update event received')
      debouncedChartRefresh()
      debouncedStatsRefresh()
    }

    window.addEventListener('portfolio-updated', handlePortfolioUpdate)
    return () => window.removeEventListener('portfolio-updated', handlePortfolioUpdate)
  }, [debouncedChartRefresh, debouncedStatsRefresh])

  // Prepare chart data with better formatting
  const processedChartData = chartData.map((point, index) => {
    const date = new Date(point.date)
    let formattedDate = ''
    
    // Format date based on selected range
    if (selectedRange === 1) {
      // 24H: show hours
      formattedDate = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (selectedRange === 7) {
      // 7D: show day of week
      formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } else {
      // 30D: show month/day
      formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    return {
      ...point,
      date: formattedDate,
      time: date.getTime(),
      formattedValue: point.value.toFixed(2),
      index
    }
  })

  // Use real-time portfolio stats for current values
  const currentValue = portfolio.length > 0 ? portfolioStats.totalValue : (stats?.totalValue || 0)
  const change24h = stats?.valueChange24h || 0
  const changePercent24h = stats?.valueChange24hPercentage || 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-base font-semibold text-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (statsLoading || chartLoading) {
    return (
      <DashboardCard className="p-6 col-span-full lg:col-span-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-muted/20 rounded animate-pulse mb-2 w-32"></div>
            <div className="h-8 bg-muted/20 rounded animate-pulse mb-2 w-48"></div>
            <div className="h-4 bg-muted/20 rounded animate-pulse w-40"></div>
          </div>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <div key={range.label} className="w-12 h-6 bg-muted/20 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="h-64 bg-muted/10 rounded animate-pulse"></div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="p-6 col-span-full lg:col-span-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Portfolio Value</h3>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(currentValue)}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {change24h >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${
              change24h >= 0 ? "status-positive" : "status-negative"
            }`}>
              {change24h >= 0 ? "+" : ""}{formatCurrency(change24h)} ({changePercent24h.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(range.days)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedRange === range.days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary hover:bg-muted/20"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Chart */}
      <div className="h-64 w-full">
        {processedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
                  return `$${value.toFixed(0)}`
                }}
                domain={['dataMin * 0.95', 'dataMax * 1.05']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No portfolio data available</p>
              <p className="text-sm">Connect a wallet to view your portfolio</p>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
