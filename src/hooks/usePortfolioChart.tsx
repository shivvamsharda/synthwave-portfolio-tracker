
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"
import { supabase } from "@/integrations/supabase/client"
import { PortfolioHistoryService, PortfolioHistoryPoint } from "@/services/portfolioHistoryService"

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

export function usePortfolioChart(days: number = 30) {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<PortfolioHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchChartData = async () => {
    if (!user || isRefreshing) {
      setChartData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsRefreshing(true)

      const history = await PortfolioHistoryService.getPortfolioHistory(user.id, days)
      
      if (history.length === 0) {
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
      setIsRefreshing(false)
    }
  }

  // Debounced refresh function to prevent rapid-fire updates
  const debouncedRefresh = useCallback(
    debounce(() => {
      console.log('[PortfolioChart] Debounced refresh triggered')
      fetchChartData()
    }, 2000), // 2 second debounce
    [user, days]
  )

  useEffect(() => {
    fetchChartData()
  }, [user, days])

  // ONLY listen to manual portfolio update events with debouncing
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('[PortfolioChart] Manual portfolio update event received - debounced')
      debouncedRefresh()
    }

    window.addEventListener('portfolio-updated', handlePortfolioUpdate)
    return () => {
      window.removeEventListener('portfolio-updated', handlePortfolioUpdate)
    }
  }, [debouncedRefresh])

  return {
    chartData,
    loading,
    error,
    refreshChartData: fetchChartData
  }
}
