import { DashboardCard } from "@/components/ui/dashboard-card"
import { usePortfolioStats } from "@/hooks/usePortfolioStats"
import { usePortfolio } from "@/hooks/usePortfolio"
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react"
import { useEffect, useCallback } from "react"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  loading?: boolean
}

function StatCard({ title, value, change, changeType, icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <DashboardCard className="p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-muted/20 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-muted/20 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-muted/20 rounded animate-pulse w-20"></div>
          </div>
          {icon && (
            <div className="text-primary/60 animate-pulse">
              {icon}
            </div>
          )}
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className={`text-sm font-medium flex items-center gap-1 ${
            changeType === "positive" ? "status-positive" : 
            changeType === "negative" ? "status-negative" : 
            "text-muted-foreground"
          }`}>
            {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
            {changeType === "negative" && <TrendingDown className="w-3 h-3" />}
            {change}
          </p>
        </div>
        {icon && (
          <div className="text-primary/60">
            {icon}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}

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

export function PortfolioStats() {
  const { stats, loading, error, refreshStats } = usePortfolioStats()
  const { portfolio, portfolioStats, dataFreshness } = usePortfolio()

  // Debounced refresh function
  const debouncedRefresh = useCallback(
    debounce(() => {
      console.log('[PortfolioStats] Debounced manual refresh triggered')
      refreshStats()
    }, 3000), // 3 second debounce
    [refreshStats]
  )

  // ONLY refresh stats when explicitly requested via manual portfolio update
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('[PortfolioStats] Manual portfolio update event received - debounced')
      debouncedRefresh()
    }

    window.addEventListener('portfolio-updated', handlePortfolioUpdate)
    return () => window.removeEventListener('portfolio-updated', handlePortfolioUpdate)
  }, [debouncedRefresh])

  // Use real-time portfolio stats as fallback if database stats are stale
  const displayStats = portfolio.length > 0 ? {
    totalValue: portfolioStats.totalValue,
    totalAssets: portfolioStats.totalTokens,
    totalUniqueTokens: new Set(portfolio.map(p => p.token_mint)).size,
    valueChange24h: stats?.valueChange24h || 0,
    valueChange24hPercentage: stats?.valueChange24hPercentage || 0,
    valueChange7d: stats?.valueChange7d || 0,
    valueChange7dPercentage: stats?.valueChange7dPercentage || 0
  } : stats

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(2)}%`
  }

  const formatChange = (value: number, percentage: number) => {
    const valueFormatted = formatCurrency(Math.abs(value))
    const percentageFormatted = formatPercentage(percentage)
    const sign = value >= 0 ? '+' : '-'
    return `${sign}${valueFormatted} (${percentageFormatted})`
  }

  const getChangeType = (value: number): "positive" | "negative" | "neutral" => {
    if (value > 0) return "positive"
    if (value < 0) return "negative"
    return "neutral"
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard className="p-6 col-span-full">
          <div className="text-center text-red-500">
            <p>Error loading portfolio stats: {error}</p>
          </div>
        </DashboardCard>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Portfolio Value",
      value: displayStats ? formatCurrency(displayStats.totalValue) : "$0.00",
      change: displayStats ? formatChange(displayStats.valueChange24h, displayStats.valueChange24hPercentage) : "$0.00 (0%)",
      changeType: displayStats ? getChangeType(displayStats.valueChange24h) : "neutral" as const,
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: "24h P&L",
      value: displayStats ? formatCurrency(displayStats.valueChange24h) : "$0.00",
      change: displayStats ? formatPercentage(displayStats.valueChange24hPercentage) : "0%",
      changeType: displayStats ? getChangeType(displayStats.valueChange24h) : "neutral" as const,
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "7d P&L",  
      value: displayStats ? formatCurrency(displayStats.valueChange7d) : "$0.00",
      change: displayStats ? formatPercentage(displayStats.valueChange7dPercentage) : "0%",
      changeType: displayStats ? getChangeType(displayStats.valueChange7d) : "neutral" as const,
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Total Assets",
      value: displayStats ? displayStats.totalAssets.toString() : "0",
      change: displayStats ? `${displayStats.totalUniqueTokens} unique tokens` : "0 tokens",
      changeType: "neutral" as const,
      icon: <Package className="w-6 h-6" />
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          loading={loading && !displayStats}
        />
      ))}
    </div>
  )
}
