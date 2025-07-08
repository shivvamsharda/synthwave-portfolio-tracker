import { useState, useEffect, useCallback } from 'react'
import { 
  whaleTrackingService, 
  WhaleHolder, 
  WhaleActivity, 
  WhaleStats, 
  ConcentrationData 
} from '@/services/whaleTrackingService'

export function useWhaleTracking() {
  const [topHolders, setTopHolders] = useState<WhaleHolder[]>([])
  const [whaleActivity, setWhaleActivity] = useState<WhaleActivity[]>([])
  const [whaleStats, setWhaleStats] = useState<WhaleStats>({
    total_whales: 0,
    new_this_week: 0,
    whale_dominance: 0,
    active_alerts: 0
  })
  const [concentrationData, setConcentrationData] = useState<ConcentrationData>({
    top_10_percentage: 0,
    top_50_percentage: 0,
    top_100_percentage: 0,
    risk_level: 'low'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTopHolders = useCallback(async (tokenMint: string, limit: number = 50, minUsdValue: number = 100000) => {
    try {
      setLoading(true)
      setError(null)
      const holders = await whaleTrackingService.getTopHolders(tokenMint, limit, minUsdValue)
      setTopHolders(holders)
    } catch (err) {
      setError('Failed to load top holders')
      console.error('Error loading top holders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWhaleActivity = useCallback(async (tokenMint: string, limit: number = 20) => {
    try {
      setLoading(true)
      setError(null)
      const activity = await whaleTrackingService.getWhaleActivity(tokenMint, limit)
      setWhaleActivity(activity)
    } catch (err) {
      setError('Failed to load whale activity')
      console.error('Error loading whale activity:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWhaleStats = useCallback(async (tokenMint: string) => {
    try {
      setLoading(true)
      setError(null)
      const stats = await whaleTrackingService.getWhaleStats(tokenMint)
      setWhaleStats(stats)
    } catch (err) {
      setError('Failed to load whale stats')
      console.error('Error loading whale stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadConcentrationData = useCallback(async (tokenMint: string) => {
    try {
      setLoading(true)
      setError(null)
      const concentration = await whaleTrackingService.getConcentrationData(tokenMint)
      setConcentrationData(concentration)
    } catch (err) {
      setError('Failed to load concentration data')
      console.error('Error loading concentration data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAllWhaleData = useCallback(async (tokenMint: string, minUsdValue: number = 100000) => {
    if (!tokenMint) return

    try {
      setLoading(true)
      setError(null)
      
      // Load all whale data in parallel
      await Promise.all([
        loadTopHolders(tokenMint, 50, minUsdValue),
        loadWhaleActivity(tokenMint, 20),
        loadWhaleStats(tokenMint),
        loadConcentrationData(tokenMint)
      ])
    } catch (err) {
      setError('Failed to load whale data')
      console.error('Error loading whale data:', err)
    } finally {
      setLoading(false)
    }
  }, [loadTopHolders, loadWhaleActivity, loadWhaleStats, loadConcentrationData])

  const refreshData = useCallback((tokenMint: string, minUsdValue: number = 100000) => {
    whaleTrackingService.clearCache()
    loadAllWhaleData(tokenMint, minUsdValue)
  }, [loadAllWhaleData])

  return {
    topHolders,
    whaleActivity,
    whaleStats,
    concentrationData,
    loading,
    error,
    loadTopHolders,
    loadWhaleActivity,
    loadWhaleStats,
    loadConcentrationData,
    loadAllWhaleData,
    refreshData
  }
}