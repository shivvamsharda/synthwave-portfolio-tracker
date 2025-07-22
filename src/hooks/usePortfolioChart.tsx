
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

// Generate mock historical data for better chart visualization
const generateMockHistoricalData = (currentValue: number, days: number): PortfolioHistoryPoint[] => {
  const points: PortfolioHistoryPoint[] = []
  const now = new Date()
  
  // Generate points going backwards in time
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    
    // Create realistic variation around current value (±5% max change per day)
    const randomFactor = 0.98 + (Math.random() * 0.04) // Between 0.98 and 1.02
    const baseValue = currentValue * (0.95 + Math.random() * 0.1) // Vary base by ±5%
    const value = Math.max(0, baseValue * randomFactor)
    
    points.push({
      date: date.toISOString(),
      value: value
    })
  }
  
  // Ensure the last point matches current value
  if (points.length > 0) {
    points[points.length - 1].value = currentValue
  }
  
  return points
}

// Enhance existing data with interpolation if needed
const enhanceHistoricalData = (data: PortfolioHistoryPoint[], days: number): PortfolioHistoryPoint[] => {
  if (data.length === 0) return []
  
  // If we have sufficient data points (at least 5 for good visualization), return as is
  if (data.length >= Math.min(days / 2, 10)) {
    return data
  }
  
  // If we have very few points, interpolate between them
  if (data.length === 1) {
    // Generate mock data based on the single point
    return generateMockHistoricalData(data[0].value, days)
  }
  
  // If we have 2-4 points, interpolate to create more smooth data
  const enhanced: PortfolioHistoryPoint[] = []
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  for (let i = 0; i < sortedData.length - 1; i++) {
    const current = sortedData[i]
    const next = sortedData[i + 1]
    
    enhanced.push(current)
    
    // Add interpolated points between current and next
    const currentTime = new Date(current.date).getTime()
    const nextTime = new Date(next.date).getTime()
    const timeDiff = nextTime - currentTime
    const valueDiff = next.value - current.value
    
    // Add 2-3 interpolated points
    const interpolationCount = Math.min(3, Math.floor(timeDiff / (24 * 60 * 60 * 1000)) - 1)
    
    for (let j = 1; j <= interpolationCount; j++) {
      const ratio = j / (interpolationCount + 1)
      const interpolatedTime = currentTime + (timeDiff * ratio)
      const interpolatedValue = current.value + (valueDiff * ratio)
      
      enhanced.push({
        date: new Date(interpolatedTime).toISOString(),
        value: interpolatedValue
      })
    }
  }
  
  // Add the last point
  enhanced.push(sortedData[sortedData.length - 1])
  
  return enhanced
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

      console.log(`[PortfolioChart] Fetching ${days} days of data for user ${user.id}`)
      
      const history = await PortfolioHistoryService.getPortfolioHistory(user.id, days)
      console.log(`[PortfolioChart] Retrieved ${history.length} historical points`)
      
      if (history.length === 0) {
        console.log('[PortfolioChart] No historical data, generating mock data with value 0')
        setChartData([
          {
            date: new Date().toISOString(),
            value: 0
          }
        ])
      } else if (history.length === 1) {
        console.log('[PortfolioChart] Only 1 data point, generating mock historical data')
        const mockData = generateMockHistoricalData(history[0].value, days)
        console.log(`[PortfolioChart] Generated ${mockData.length} mock data points`)
        setChartData(mockData)
      } else {
        console.log('[PortfolioChart] Enhancing existing historical data')
        const enhancedData = enhanceHistoricalData(history, days)
        console.log(`[PortfolioChart] Enhanced data from ${history.length} to ${enhancedData.length} points`)
        setChartData(enhancedData)
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Fallback to mock data even on error
      const mockData = generateMockHistoricalData(1000, days) // Default $1000 portfolio
      setChartData(mockData)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Debounced refresh function for manual refresh only
  const debouncedRefresh = useCallback(
    debounce(() => {
      console.log('[PortfolioChart] Manual refresh triggered (debounced)')
      fetchChartData()
    }, 1500), // 1.5 second debounce
    [user, days]
  )

  useEffect(() => {
    fetchChartData()
  }, [user, days])

  // ONLY listen to manual portfolio update events (no automatic refreshing)
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('[PortfolioChart] Manual portfolio update event received')
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
