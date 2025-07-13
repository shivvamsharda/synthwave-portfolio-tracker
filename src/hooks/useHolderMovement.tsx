import { useState, useCallback } from 'react'
import { holderMovementService, HolderMovementMetrics, HolderActivity, FlowPattern } from '@/services/holderMovementService'
import { useApiKeys } from './useApiKeys'
import { useToast } from './use-toast'

export function useHolderMovement() {
  const [metrics, setMetrics] = useState<HolderMovementMetrics>({
    newBuyers: 0,
    sellers: 0,
    netPositiveFlow: 0,
    totalVolume: 0,
    averageTradeSize: 0,
    whaleActivity: 0
  })
  const [activities, setActivities] = useState<HolderActivity[]>([])
  const [flowPatterns, setFlowPatterns] = useState<FlowPattern[]>([])
  const [loading, setLoading] = useState(false)
  const { apiKeys } = useApiKeys()
  const { toast } = useToast()

  const analyzeToken = useCallback(async (
    tokenMint: string, 
    timeframe: '24h' | '7d' | '30d'
  ) => {
    setLoading(true)
    try {
      const result = await holderMovementService.analyzeHolderMovements(
        tokenMint,
        timeframe,
        {
          birdeye: apiKeys.birdeye,
          helius: apiKeys.helius
        }
      )

      setMetrics(result.metrics)
      setActivities(result.activities)
      setFlowPatterns(result.flowPatterns)
    } catch (error) {
      console.error('Error analyzing holder movements:', error)
      toast({
        title: "Error",
        description: "Failed to analyze holder movements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiKeys, toast])

  const refreshData = useCallback(async (
    tokenMint: string, 
    timeframe: '24h' | '7d' | '30d'
  ) => {
    // Clear cache and fetch fresh data
    holderMovementService.clearCache()
    await analyzeToken(tokenMint, timeframe)
  }, [analyzeToken])

  return {
    metrics,
    activities,
    flowPatterns,
    loading,
    analyzeToken,
    refreshData
  }
}