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
  }, [user, days])

  // Remove automatic refresh to prevent loops

  return {
    chartData,
    loading,
    error,
    refreshChartData: fetchChartData
  }
}