import { useState, useCallback } from 'react'
import { bitqueryService, HolderMovementData, WhaleActivity, TokenFlowData } from '@/services/bitqueryService'
import { useApiKeys } from './useApiKeys'
import { useToast } from './use-toast'

export function useBitQueryData() {
  const [holderMovement, setHolderMovement] = useState<HolderMovementData>({
    newBuyers: 0,
    sellers: 0,
    totalBuyVolume: 0,
    totalSellVolume: 0,
    netFlow: 0,
    whaleActivityCount: 0,
    averageTradeSize: 0,
    activities: []
  })
  
  const [whaleActivities, setWhaleActivities] = useState<WhaleActivity[]>([])
  const [tokenFlows, setTokenFlows] = useState<TokenFlowData>({
    inflows: [],
    outflows: [],
    netFlow: {
      totalInflow: 0,
      totalOutflow: 0,
      netAmount: 0,
      netPercentage: 0
    }
  })
  
  const [loading, setLoading] = useState(false)
  // const { apiKeys } = useApiKeys() // BitQuery API key would go here
  const { toast } = useToast()

  const fetchHolderMovementData = useCallback(async (
    tokenMint: string,
    timeframe: '24h' | '7d' | '30d' = '24h'
  ) => {
    setLoading(true)
    try {
      const data = await bitqueryService.getHolderMovementData(tokenMint, timeframe)
      setHolderMovement(data)
    } catch (error) {
      console.error('Error fetching holder movement data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch holder movement data. Using demo data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiKeys.bitquery, toast])

  const fetchWhaleActivity = useCallback(async (
    tokenMint: string,
    minUsdAmount: number = 10000
  ) => {
    setLoading(true)
    try {
      const data = await bitqueryService.getWhaleActivity(tokenMint, minUsdAmount)
      setWhaleActivities(data)
    } catch (error) {
      console.error('Error fetching whale activity:', error)
      toast({
        title: "Error",
        description: "Failed to fetch whale activity data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiKeys.bitquery, toast])

  const fetchTokenFlows = useCallback(async (
    tokenMint: string,
    timeframe: '24h' | '7d' | '30d' = '24h'
  ) => {
    setLoading(true)
    try {
      const data = await bitqueryService.getTokenFlowData(tokenMint, timeframe)
      setTokenFlows(data)
    } catch (error) {
      console.error('Error fetching token flow data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch token flow data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiKeys.bitquery, toast])

  const refreshAllData = useCallback(async (
    tokenMint: string,
    timeframe: '24h' | '7d' | '30d' = '24h',
    minWhaleAmount: number = 10000
  ) => {
    bitqueryService.clearCache()
    await Promise.all([
      fetchHolderMovementData(tokenMint, timeframe),
      fetchWhaleActivity(tokenMint, minWhaleAmount),
      fetchTokenFlows(tokenMint, timeframe)
    ])
  }, [fetchHolderMovementData, fetchWhaleActivity, fetchTokenFlows])

  return {
    holderMovement,
    whaleActivities,
    tokenFlows,
    loading,
    fetchHolderMovementData,
    fetchWhaleActivity,
    fetchTokenFlows,
    refreshAllData
  }
}