
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./useAuth"

export interface PortfolioStats {
  totalValue: number
  totalValue24hAgo: number
  totalValue7dAgo: number
  valueChange24h: number
  valueChange24hPercentage: number
  valueChange7d: number
  valueChange7dPercentage: number
  totalAssets: number
  totalUniqueTokens: number
}

export function usePortfolioStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchPortfolioStats = async () => {
    if (!user || isRefreshing) {
      setStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsRefreshing(true)

      // Check if user has any current portfolio data
      const { data: currentPortfolio } = await supabase
        .from('portfolio')
        .select('usd_value')
        .eq('user_id', user.id)

      const currentTotalValue = currentPortfolio?.reduce((sum, item) => sum + (item.usd_value || 0), 0) || 0
      const currentTotalAssets = currentPortfolio?.length || 0

      console.log('[PortfolioStats] Current portfolio value:', currentTotalValue, 'assets:', currentTotalAssets)

      if (currentTotalValue === 0) {
        console.log('[PortfolioStats] No current portfolio, returning zero stats')
        setStats({
          totalValue: 0,
          totalValue24hAgo: 0,
          totalValue7dAgo: 0,
          valueChange24h: 0,
          valueChange24hPercentage: 0,
          valueChange7d: 0,
          valueChange7dPercentage: 0,
          totalAssets: 0,
          totalUniqueTokens: 0
        })
        setLoading(false)
        return
      }

      // Call the database function to get portfolio statistics
      const { data, error: statsError } = await supabase
        .rpc('calculate_portfolio_stats', { user_uuid: user.id })

      if (statsError) {
        console.error('Error fetching portfolio stats:', statsError)
        setStats({
          totalValue: currentTotalValue,
          totalValue24hAgo: currentTotalValue,
          totalValue7dAgo: currentTotalValue,
          valueChange24h: 0,
          valueChange24hPercentage: 0,
          valueChange7d: 0,
          valueChange7dPercentage: 0,
          totalAssets: currentTotalAssets,
          totalUniqueTokens: currentTotalAssets
        })
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        const statsData = data[0]
        setStats({
          totalValue: Number(statsData.total_value || currentTotalValue),
          totalValue24hAgo: Number(statsData.total_value_24h_ago || currentTotalValue),
          totalValue7dAgo: Number(statsData.total_value_7d_ago || currentTotalValue),
          valueChange24h: Number(statsData.value_change_24h || 0),
          valueChange24hPercentage: Number(statsData.value_change_24h_percentage || 0),
          valueChange7d: Number(statsData.value_change_7d || 0),
          valueChange7dPercentage: Number(statsData.value_change_7d_percentage || 0),
          totalAssets: Number(statsData.total_assets || currentTotalAssets),
          totalUniqueTokens: Number(statsData.total_unique_tokens || currentTotalAssets)
        })
      } else {
        console.log('[PortfolioStats] No historical data, using current values')
        setStats({
          totalValue: currentTotalValue,
          totalValue24hAgo: currentTotalValue,
          totalValue7dAgo: currentTotalValue,
          valueChange24h: 0,
          valueChange24hPercentage: 0,
          valueChange7d: 0,
          valueChange7dPercentage: 0,
          totalAssets: currentTotalAssets,
          totalUniqueTokens: currentTotalAssets
        })
      }
    } catch (err) {
      console.error('Error in fetchPortfolioStats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load only - no automatic refresh intervals
  useEffect(() => {
    if (user) {
      fetchPortfolioStats()
    }
  }, [user])

  // Manual refresh only - no automatic event listeners

  return {
    stats,
    loading,
    error,
    refreshStats: fetchPortfolioStats
  }
}
