import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import { supabase } from "@/integrations/supabase/client"
import { PortfolioHistoryService, PortfolioHistoryPoint } from "@/services/portfolioHistoryService"

export function usePortfolioChart(days: number = 30) {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<PortfolioHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async () => {
    if (!user) {
      setChartData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const history = await PortfolioHistoryService.getPortfolioHistory(user.id, days)
      
      // If no historical data, create a single point with current portfolio value
      if (history.length === 0) {
        // We'll use a default point - in a real scenario, this would come from current portfolio
        setChartData([
          {
            date: new Date().toISOString(),
            value: 0
          }
        ])
      } else {
        setChartData(history)
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
    
    if (!user) return

    // Set up real-time subscription for portfolio history changes
    const channel = supabase
      .channel('portfolio-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_history',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('[PortfolioChart] Portfolio history changed, refreshing chart data')
          fetchChartData()
        }
      )
      .subscribe()

    // Force refresh on page load after a brief delay
    const pageLoadRefresh = setTimeout(() => {
      console.log('[PortfolioChart] Page load refresh triggered')
      fetchChartData()
    }, 2000)

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(pageLoadRefresh)
    }
  }, [user, days])

  // Additional effect to refresh when portfolio data might have changed
  useEffect(() => {
    if (user) {
      // Set up subscription for portfolio changes to trigger chart refresh
      const portfolioChannel = supabase
        .channel('portfolio-for-chart')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'portfolio',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('[PortfolioChart] Portfolio data changed, may need chart refresh')
            // Small delay to let other processes complete
            setTimeout(() => {
              fetchChartData()
            }, 3000)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(portfolioChannel)
      }
    }
  }, [user])

  return {
    chartData,
    loading,
    error,
    refreshChartData: fetchChartData
  }
}