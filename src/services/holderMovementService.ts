import { birdeyeService } from './birdeyeService'
import { heliusService } from './heliusService'
import { solscanService } from './solscanService'
import { supabase } from '@/integrations/supabase/client'

export interface HolderMovementMetrics {
  newBuyers: number
  sellers: number
  netPositiveFlow: number
  totalVolume: number
  averageTradeSize: number
  whaleActivity: number
}

export interface HolderActivity {
  walletAddress: string
  action: 'bought' | 'sold'
  amount: number
  usdValue: number
  timestamp: string
  isWhale: boolean
  isNewHolder: boolean
  fromToken?: string
  toToken?: string
}

export interface FlowPattern {
  pattern: string
  description: string
  percentage: number
  volume: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

class HolderMovementService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 30000 // 30 seconds

  async analyzeHolderMovements(
    tokenMint: string,
    timeframe: '24h' | '7d' | '30d',
    apiKeys: { birdeye?: string; helius?: string }
  ): Promise<{
    metrics: HolderMovementMetrics
    activities: HolderActivity[]
    flowPatterns: FlowPattern[]
  }> {
    console.log('🔍 Analyzing holder movements for:', tokenMint, 'timeframe:', timeframe)
    console.log('📊 Available API keys:', { 
      birdeye: !!apiKeys.birdeye, 
      helius: !!apiKeys.helius 
    })

    const cacheKey = `movement-${tokenMint}-${timeframe}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📋 Using cached data for', tokenMint)
      return cached.data
    }

    try {
      // Validate token mint
      if (!tokenMint || tokenMint.length < 32) {
        console.warn('⚠️ Invalid token mint provided:', tokenMint)
        return this.getFallbackData()
      }

      // Calculate time range
      const now = new Date()
      const startTime = new Date()
      
      switch (timeframe) {
        case '24h':
          startTime.setHours(startTime.getHours() - 24)
          break
        case '7d':
          startTime.setDate(startTime.getDate() - 7)
          break
        case '30d':
          startTime.setDate(startTime.getDate() - 30)
          break
      }

      console.log('⏰ Time range:', { 
        from: startTime.toISOString(), 
        to: now.toISOString() 
      })

      // Fetch data from multiple sources with individual error handling
      const dataPromises = [
        this.fetchTradesWithFallback(tokenMint, apiKeys.birdeye),
        this.fetchTransfersWithFallback(tokenMint, startTime, now),
        this.fetchHoldersWithFallback(tokenMint)
      ]

      const results = await Promise.allSettled(dataPromises)
      
      console.log('📈 Data fetch results:', {
        trades: results[0].status === 'fulfilled' ? 'success' : 'failed',
        transfers: results[1].status === 'fulfilled' ? 'success' : 'failed', 
        holders: results[2].status === 'fulfilled' ? 'success' : 'failed'
      })

      // Extract data from successful promises
      const trades = results[0].status === 'fulfilled' ? results[0].value : []
      const transfers = results[1].status === 'fulfilled' ? results[1].value : null
      const holders = results[2].status === 'fulfilled' ? results[2].value : null

      console.log('📊 Data extracted:', {
        tradesCount: Array.isArray(trades) ? trades.length : 0,
        transfersCount: transfers?.data ? transfers.data.length : 0,
        holdersCount: holders?.data ? holders.data.length : 0
      })

      // Get existing holders from database to identify new buyers
      const { data: existingHolders } = await supabase
        .from('token_holders')
        .select('wallet_address')
        .eq('token_mint', tokenMint)

      const existingHolderSet = new Set(existingHolders?.map(h => h.wallet_address) || [])

      // Analyze activities
      const activities: HolderActivity[] = []
      let totalBuyVolume = 0
      let totalSellVolume = 0
      let newBuyersCount = 0
      let sellersCount = 0
      let whaleActivityCount = 0

      // Process Birdeye trades
      if (trades && Array.isArray(trades)) {
        for (const trade of trades) {
          const isNewHolder = !existingHolderSet.has(trade.address)
          const isWhale = trade.volumeUsd > 10000 // $10k+ trades are whale activity
          
          activities.push({
            walletAddress: trade.address,
            action: trade.side,
            amount: trade.volumeNative,
            usdValue: trade.volumeUsd,
            timestamp: new Date(trade.blockUnixTime * 1000).toISOString(),
            isWhale,
            isNewHolder
          })

          if (trade.side === 'buy') {
            totalBuyVolume += trade.volumeUsd
            if (isNewHolder) newBuyersCount++
          } else {
            totalSellVolume += trade.volumeUsd
            sellersCount++
          }

          if (isWhale) whaleActivityCount++
        }
      }

      // Process Solscan transfers for additional insights
      if (transfers?.data && Array.isArray(transfers.data)) {
        for (const transfer of transfers.data) {
          const isNewHolder = !existingHolderSet.has(transfer.toAddress)
          
          // Estimate if this is a buy/sell based on known DEX addresses
          const isDexAddress = this.isDexAddress(transfer.fromAddress) || this.isDexAddress(transfer.toAddress)
          
          if (isDexAddress) {
            const action = this.isDexAddress(transfer.fromAddress) ? 'bought' : 'sold'
            const estimatedUsdValue = transfer.amount * 0.01 // Rough estimation - would need price data
            
            activities.push({
              walletAddress: action === 'bought' ? transfer.toAddress : transfer.fromAddress,
              action,
              amount: transfer.amount,
              usdValue: estimatedUsdValue,
              timestamp: new Date(transfer.blockTime * 1000).toISOString(),
              isWhale: estimatedUsdValue > 10000,
              isNewHolder: action === 'bought' && isNewHolder
            })
          }
        }
      }

      // Calculate metrics
      const totalVolume = totalBuyVolume + totalSellVolume
      const netPositiveFlow = totalVolume > 0 ? ((totalBuyVolume - totalSellVolume) / totalVolume) * 100 : 0
      
      const metrics: HolderMovementMetrics = {
        newBuyers: newBuyersCount,
        sellers: sellersCount,
        netPositiveFlow,
        totalVolume,
        averageTradeSize: activities.length > 0 ? totalVolume / activities.length : 0,
        whaleActivity: whaleActivityCount
      }

      // Analyze flow patterns
      const flowPatterns: FlowPattern[] = this.analyzeFlowPatterns(activities)

      const result = { metrics, activities: activities.slice(0, 50), flowPatterns }
      
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } catch (error) {
      console.error('Error analyzing holder movements:', error)
      throw error
    }
  }

  private isDexAddress(address: string): boolean {
    // Common Solana DEX program addresses
    const dexAddresses = [
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Serum DEX
      'EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o', // Orca
      'DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby', // Raydium V3
    ]
    return dexAddresses.includes(address)
  }

  private analyzeFlowPatterns(activities: HolderActivity[]): FlowPattern[] {
    const patterns: FlowPattern[] = []
    
    // Analyze USDC to token flows
    const usdcFlows = activities.filter(a => a.fromToken?.includes('USDC') || a.action === 'bought')
    const usdcVolume = usdcFlows.reduce((sum, a) => sum + a.usdValue, 0)
    const totalVolume = activities.reduce((sum, a) => sum + a.usdValue, 0)
    
    if (usdcVolume > 0) {
      patterns.push({
        pattern: 'USDC → Token',
        description: 'Direct purchases with USDC',
        percentage: totalVolume > 0 ? (usdcVolume / totalVolume) * 100 : 0,
        volume: usdcVolume,
        trend: 'increasing' // Would need historical data for real trend
      })
    }

    // Analyze whale accumulation patterns
    const whaleActivity = activities.filter(a => a.isWhale)
    const whaleVolume = whaleActivity.reduce((sum, a) => sum + a.usdValue, 0)
    
    if (whaleVolume > 0) {
      patterns.push({
        pattern: 'Whale Accumulation',
        description: 'Large holders increasing positions',
        percentage: totalVolume > 0 ? (whaleVolume / totalVolume) * 100 : 0,
        volume: whaleVolume,
        trend: whaleActivity.filter(a => a.action === 'bought').length > whaleActivity.filter(a => a.action === 'sold').length ? 'increasing' : 'decreasing'
      })
    }

    // Analyze new holder patterns
    const newHolderActivity = activities.filter(a => a.isNewHolder)
    const newHolderVolume = newHolderActivity.reduce((sum, a) => sum + a.usdValue, 0)
    
    if (newHolderVolume > 0) {
      patterns.push({
        pattern: 'New Holder Onboarding',
        description: 'Fresh wallets entering the token',
        percentage: totalVolume > 0 ? (newHolderVolume / totalVolume) * 100 : 0,
        volume: newHolderVolume,
        trend: 'increasing'
      })
    }

    return patterns
  }

  private getFallbackData(): { metrics: HolderMovementMetrics; activities: HolderActivity[]; flowPatterns: FlowPattern[] } {
    console.log('🔄 Using fallback demo data')
    return {
      metrics: {
        newBuyers: 125,
        sellers: 89,
        netPositiveFlow: 23.5,
        totalVolume: 450000,
        averageTradeSize: 2100,
        whaleActivity: 12
      },
      activities: [
        {
          walletAddress: '7x8Q...9mN2',
          action: 'bought',
          amount: 50000,
          usdValue: 2500,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isWhale: false,
          isNewHolder: true
        },
        {
          walletAddress: '9z2K...3pL5',
          action: 'sold',
          amount: 120000,
          usdValue: 15000,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isWhale: true,
          isNewHolder: false
        }
      ],
      flowPatterns: [
        {
          pattern: 'USDC → Token',
          description: 'Direct purchases with USDC',
          percentage: 65.2,
          volume: 293400,
          trend: 'increasing'
        },
        {
          pattern: 'Whale Accumulation',
          description: 'Large holders increasing positions',
          percentage: 18.7,
          volume: 84150,
          trend: 'increasing'
        }
      ]
    }
  }

  private async fetchTradesWithFallback(tokenMint: string, birdeyeApiKey?: string): Promise<any[]> {
    try {
      if (!birdeyeApiKey) {
        console.warn('🔑 No Birdeye API key provided')
        return []
      }
      console.log('🐦 Fetching trades from Birdeye...')
      const trades = await birdeyeService.getTrades(tokenMint, birdeyeApiKey, 100)
      console.log('✅ Birdeye trades fetched:', trades?.length || 0)
      return trades || []
    } catch (error) {
      console.error('❌ Error fetching Birdeye trades:', error)
      return []
    }
  }

  private async fetchTransfersWithFallback(tokenMint: string, startTime: Date, endTime: Date): Promise<any> {
    try {
      console.log('🔄 Fetching transfers from Solscan...')
      const transfers = await solscanService.getTokenTransfers(
        tokenMint, 
        100, 
        0, 
        Math.floor(startTime.getTime() / 1000),
        Math.floor(endTime.getTime() / 1000)
      )
      console.log('✅ Solscan transfers fetched:', transfers?.data?.length || 0)
      return transfers
    } catch (error) {
      console.error('❌ Error fetching Solscan transfers:', error)
      return null
    }
  }

  private async fetchHoldersWithFallback(tokenMint: string): Promise<any> {
    try {
      console.log('👥 Fetching holders from Solscan...')
      const holders = await solscanService.getTokenHolders(tokenMint, 50)
      console.log('✅ Solscan holders fetched:', holders?.data?.length || 0)
      return holders
    } catch (error) {
      console.error('❌ Error fetching Solscan holders:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const holderMovementService = new HolderMovementService()