import { useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "./use-toast"

export interface TokenHolder {
  id: string
  tokenMint: string
  walletAddress: string
  balance: number
  usdValue: number | null
  percentageOfSupply: number | null
  holderRank: number | null
  lastUpdated: string
}

export interface TokenTransaction {
  id: string
  transactionHash: string
  walletAddress: string
  tokenMintFrom: string | null
  tokenMintTo: string | null
  amountFrom: number | null
  amountTo: number | null
  transactionType: string
  timestamp: string
  blockHeight: number | null
}

export interface TokenFlow {
  id: string
  tokenMint: string
  flowDirection: string
  sourceToken: string | null
  destinationToken: string | null
  totalVolume: number
  uniqueWallets: number
  timePeriod: string
  analysisDate: string
}

export interface HolderMovement {
  walletAddress: string
  action: "bought" | "sold" | "transferred"
  fromToken?: string
  toToken?: string
  amount: string
  usdValue: number
  timestamp: string
  nextAction?: string
}

export interface WhaleActivity {
  wallet: string
  action: string
  amount: string
  usdValue: number
  timestamp: string
  impact: "low" | "medium" | "high"
}

export function useTokenAnalytics() {
  const [topHolders, setTopHolders] = useState<TokenHolder[]>([])
  const [holderMovements, setHolderMovements] = useState<HolderMovement[]>([])
  const [whaleActivity, setWhaleActivity] = useState<WhaleActivity[]>([])
  const [tokenFlows, setTokenFlows] = useState<TokenFlow[]>([])
  const [loadingHolders, setLoadingHolders] = useState(false)
  const [loadingMovements, setLoadingMovements] = useState(false)
  const [loadingWhales, setLoadingWhales] = useState(false)
  const [loadingFlows, setLoadingFlows] = useState(false)
  const { toast } = useToast()

  const getTopHolders = useCallback(async (tokenMint: string, limit: number = 50) => {
    setLoadingHolders(true)
    try {
      const { data, error } = await supabase
        .from('token_holders')
        .select('*')
        .eq('token_mint', tokenMint)
        .order('holder_rank', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching top holders:', error)
        toast({
          title: "Error",
          description: "Failed to fetch token holders data",
          variant: "destructive",
        })
        return
      }

      // Map database response to interface
      const mappedHolders: TokenHolder[] = (data || []).map(holder => ({
        id: holder.id,
        tokenMint: holder.token_mint,
        walletAddress: holder.wallet_address,
        balance: holder.balance,
        usdValue: holder.usd_value,
        percentageOfSupply: holder.percentage_of_supply,
        holderRank: holder.holder_rank,
        lastUpdated: holder.last_updated
      }))
      
      setTopHolders(mappedHolders)
    } catch (error) {
      console.error('Error fetching top holders:', error)
      toast({
        title: "Error", 
        description: "Failed to fetch token holders data",
        variant: "destructive",
      })
    } finally {
      setLoadingHolders(false)
    }
  }, [toast])

  const getHolderMovements = useCallback(async (tokenMint: string, timeframe: "24h" | "7d" | "30d") => {
    setLoadingMovements(true)
    try {
      // Calculate the date range based on timeframe
      const now = new Date()
      const startDate = new Date()
      
      switch (timeframe) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24)
          break
        case "7d":
          startDate.setDate(startDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(startDate.getDate() - 30)
          break
      }

      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching holder movements:', error)
        toast({
          title: "Error",
          description: "Failed to fetch holder movements data",
          variant: "destructive",
        })
        return
      }

      // Transform transaction data to holder movements
      const movements: HolderMovement[] = (data || []).map(tx => ({
        walletAddress: tx.wallet_address,
        action: tx.token_mint_to === tokenMint ? "bought" : "sold",
        fromToken: tx.token_mint_from || undefined,
        toToken: tx.token_mint_to || undefined,
        amount: `${tx.amount_to || tx.amount_from || 0}`,
        usdValue: 0, // Would need price data to calculate
        timestamp: tx.timestamp
      }))

      setHolderMovements(movements)
    } catch (error) {
      console.error('Error fetching holder movements:', error)
      toast({
        title: "Error",
        description: "Failed to fetch holder movements data", 
        variant: "destructive",
      })
    } finally {
      setLoadingMovements(false)
    }
  }, [toast])

  const getWhaleActivity = useCallback(async (tokenMint: string, minHoldingAmount: number) => {
    setLoadingWhales(true)
    try {
      // Get recent transactions from large holders
      const { data: whaleHolders, error: holdersError } = await supabase
        .from('token_holders')
        .select('wallet_address, usd_value')
        .eq('token_mint', tokenMint)
        .gte('usd_value', minHoldingAmount)
        .order('usd_value', { ascending: false })

      if (holdersError) {
        console.error('Error fetching whale holders:', holdersError)
        return
      }

      const whaleAddresses = whaleHolders?.map(h => h.wallet_address) || []
      
      if (whaleAddresses.length === 0) {
        setWhaleActivity([])
        return
      }

      // Get recent transactions from these whale addresses
      const { data: transactions, error: txError } = await supabase
        .from('token_transactions')
        .select('*')
        .in('wallet_address', whaleAddresses)
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (txError) {
        console.error('Error fetching whale transactions:', txError)
        return
      }

      // Transform to whale activity format
      const activity: WhaleActivity[] = (transactions || []).map(tx => ({
        wallet: tx.wallet_address,
        action: tx.token_mint_to === tokenMint ? "Large Buy" : "Large Sale",
        amount: `${tx.amount_to || tx.amount_from || 0}`,
        usdValue: 0, // Would need price calculation
        timestamp: new Date(tx.timestamp).toLocaleString(),
        impact: "medium" as const // Would calculate based on amount vs market cap
      }))

      setWhaleActivity(activity)
    } catch (error) {
      console.error('Error fetching whale activity:', error)
      toast({
        title: "Error",
        description: "Failed to fetch whale activity data",
        variant: "destructive",
      })
    } finally {
      setLoadingWhales(false)
    }
  }, [toast])

  const getTokenFlows = useCallback(async (tokenMint: string, timeframe: "24h" | "7d" | "30d") => {
    setLoadingFlows(true)
    try {
      const { data, error } = await supabase
        .from('token_flow_analysis')
        .select('*')
        .eq('token_mint', tokenMint)
        .eq('time_period', timeframe)
        .order('analysis_date', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching token flows:', error)
        toast({
          title: "Error",
          description: "Failed to fetch token flow data",
          variant: "destructive",
        })
        return
      }

      // Map database response to interface
      const mappedFlows: TokenFlow[] = (data || []).map(flow => ({
        id: flow.id,
        tokenMint: flow.token_mint,
        flowDirection: flow.flow_direction,
        sourceToken: flow.source_token,
        destinationToken: flow.destination_token,
        totalVolume: flow.total_volume,
        uniqueWallets: flow.unique_wallets,
        timePeriod: flow.time_period,
        analysisDate: flow.analysis_date
      }))
      
      setTokenFlows(mappedFlows)
    } catch (error) {
      console.error('Error fetching token flows:', error)
      toast({
        title: "Error",
        description: "Failed to fetch token flow data",
        variant: "destructive",
      })
    } finally {
      setLoadingFlows(false)
    }
  }, [toast])

  return {
    // Data
    topHolders,
    holderMovements,
    whaleActivity,
    tokenFlows,
    
    // Loading states
    loadingHolders,
    loadingMovements,
    loadingWhales,
    loadingFlows,
    
    // Actions
    getTopHolders,
    getHolderMovements,
    getWhaleActivity,
    getTokenFlows
  }
}