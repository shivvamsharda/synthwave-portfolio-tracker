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

  const fetchPortfolioStats = async () => {
    if (!user) {
      setStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Call the database function to get portfolio statistics
      const { data, error: statsError } = await supabase
        .rpc('calculate_portfolio_stats', { user_uuid: user.id })

      if (statsError) {
        console.error('Error fetching portfolio stats:', statsError)
        setError(statsError.message)
        return
      }

      if (data && data.length > 0) {
        const statsData = data[0]
        setStats({
          totalValue: Number(statsData.total_value || 0),
          totalValue24hAgo: Number(statsData.total_value_24h_ago || 0),
          totalValue7dAgo: Number(statsData.total_value_7d_ago || 0),
          valueChange24h: Number(statsData.value_change_24h || 0),
          valueChange24hPercentage: Number(statsData.value_change_24h_percentage || 0),
          valueChange7d: Number(statsData.value_change_7d || 0),
          valueChange7dPercentage: Number(statsData.value_change_7d_percentage || 0),
          totalAssets: Number(statsData.total_assets || 0),
          totalUniqueTokens: Number(statsData.total_unique_tokens || 0)
        })
      } else {
        // Default stats for new users
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
      }
    } catch (err) {
      console.error('Error in fetchPortfolioStats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const savePortfolioSnapshot = async () => {
    if (!user || !stats) return

    try {
      // Save current portfolio value as a snapshot for historical tracking
      const { error } = await supabase
        .from('portfolio_history')
        .insert({
          user_id: user.id,
          total_value: stats.totalValue,
          total_value_change_24h: stats.valueChange24h,
          total_value_change_percentage_24h: stats.valueChange24hPercentage,
          total_assets: stats.totalAssets
        })

      if (error) {
        console.error('Error saving portfolio snapshot:', error)
      }
    } catch (err) {
      console.error('Error in savePortfolioSnapshot:', err)
    }
  }

  useEffect(() => {
    fetchPortfolioStats()

    if (!user) return

    // Set up real-time subscription for portfolio changes
    const channel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch stats when portfolio data changes
          fetchPortfolioStats()
        }
      )
      .subscribe()

    // Save snapshot every hour
    const snapshotInterval = setInterval(() => {
      savePortfolioSnapshot()
    }, 60 * 60 * 1000) // 1 hour

    // Initial snapshot save
    setTimeout(() => {
      savePortfolioSnapshot()
    }, 5000) // Save after 5 seconds

    return () => {
      supabase.removeChannel(channel)
      clearInterval(snapshotInterval)
    }
  }, [user])

  return {
    stats,
    loading,
    error,
    refreshStats: fetchPortfolioStats,
    saveSnapshot: savePortfolioSnapshot
  }
}