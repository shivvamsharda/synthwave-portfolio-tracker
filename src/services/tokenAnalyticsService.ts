import { supabase } from '@/integrations/supabase/client'
import { holderMovementService } from './holderMovementService'
import { birdeyeService } from './birdeyeService'
import { solscanService } from './solscanService'

export interface TokenAnalyticsData {
  tokenMint: string
  timestamp: string
  newBuyers: number
  sellers: number
  netPositiveFlow: number
  totalVolume: number
  whaleActivity: number
  topHolders: any[]
  recentActivities: any[]
}

class TokenAnalyticsService {
  private analysisQueue = new Set<string>()

  async scheduleAnalysis(tokenMint: string, apiKeys: any): Promise<void> {
    if (this.analysisQueue.has(tokenMint)) {
      return // Already queued
    }

    this.analysisQueue.add(tokenMint)
    
    try {
      await this.performFullAnalysis(tokenMint, apiKeys)
    } finally {
      this.analysisQueue.delete(tokenMint)
    }
  }

  private async performFullAnalysis(tokenMint: string, apiKeys: any): Promise<void> {
    try {
      // Run analysis for multiple timeframes
      const timeframes: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d']
      let latestAnalysis: any = null
      
      for (const timeframe of timeframes) {
        const analysis = await holderMovementService.analyzeHolderMovements(
          tokenMint,
          timeframe,
          apiKeys
        )

        // Store holder movement data in database
        await this.storeHolderMovementData(tokenMint, timeframe, analysis)
        
        // Keep the latest analysis for flow patterns
        if (timeframe === '24h') {
          latestAnalysis = analysis
        }
      }

      // Update token holders table
      await this.updateTokenHolders(tokenMint, apiKeys)
      
      // Update token flows with latest analysis
      if (latestAnalysis) {
        await this.updateTokenFlows(tokenMint, latestAnalysis.flowPatterns)
      }
      
    } catch (error) {
      console.error('Error performing token analysis:', error)
    }
  }

  private async storeHolderMovementData(
    tokenMint: string, 
    timeframe: string, 
    analysis: any
  ): Promise<void> {
    try {
      // Store transactions in token_transactions table
      for (const activity of analysis.activities) {
        await supabase
          .from('token_transactions')
          .upsert({
            transaction_hash: `${activity.walletAddress}-${activity.timestamp}`,
            wallet_address: activity.walletAddress,
            token_mint_from: activity.fromToken,
            token_mint_to: activity.toToken || tokenMint,
            amount_from: activity.action === 'sold' ? activity.amount : null,
            amount_to: activity.action === 'bought' ? activity.amount : null,
            transaction_type: activity.action,
            timestamp: activity.timestamp,
            block_height: Date.now() // Placeholder
          }, {
            onConflict: 'transaction_hash'
          })
      }

      console.log(`Stored ${analysis.activities.length} holder movements for ${tokenMint} (${timeframe})`)
    } catch (error) {
      console.error('Error storing holder movement data:', error)
    }
  }

  private async updateTokenHolders(tokenMint: string, apiKeys: any): Promise<void> {
    try {
      const holdersData = await solscanService.getTokenHolders(tokenMint, 100)
      
      if (!holdersData?.data) return

      // Update holders in database
      for (const holder of holdersData.data) {
        await supabase
          .from('token_holders')
          .upsert({
            wallet_address: holder.owner,
            token_mint: tokenMint,
            balance: holder.amount,
            percentage_of_supply: holder.percentage,
            holder_rank: holder.rank,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'wallet_address,token_mint'
          })
      }

      console.log(`Updated ${holdersData.data.length} token holders for ${tokenMint}`)
    } catch (error) {
      console.error('Error updating token holders:', error)
    }
  }

  private async updateTokenFlows(tokenMint: string, flowPatterns: any[]): Promise<void> {
    try {
      for (const pattern of flowPatterns) {
        await supabase
          .from('token_flow_analysis')
          .upsert({
            token_mint: tokenMint,
            flow_direction: pattern.pattern,
            total_volume: pattern.volume,
            unique_wallets: 0, // Would need to calculate this
            time_period: '24h', // Default timeframe
            analysis_date: new Date().toISOString()
          })
      }

      console.log(`Updated ${flowPatterns.length} flow patterns for ${tokenMint}`)
    } catch (error) {
      console.error('Error updating token flows:', error)
    }
  }

  async getTokenAnalyticsSummary(tokenMint: string): Promise<TokenAnalyticsData | null> {
    try {
      const [transactions, holders, flows] = await Promise.all([
        supabase
          .from('token_transactions')
          .select('*')
          .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
          .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(50),
        
        supabase
          .from('token_holders')
          .select('*')
          .eq('token_mint', tokenMint)
          .order('holder_rank', { ascending: true })
          .limit(20),
        
        supabase
          .from('token_flow_analysis')
          .select('*')
          .eq('token_mint', tokenMint)
          .eq('time_period', '24h')
          .order('analysis_date', { ascending: false })
          .limit(10)
      ])

      const buyTransactions = transactions.data?.filter(t => t.token_mint_to === tokenMint) || []
      const sellTransactions = transactions.data?.filter(t => t.token_mint_from === tokenMint) || []
      
      const totalBuyVolume = buyTransactions.reduce((sum, t) => sum + (t.amount_to || 0), 0)
      const totalSellVolume = sellTransactions.reduce((sum, t) => sum + (t.amount_from || 0), 0)
      const totalVolume = totalBuyVolume + totalSellVolume
      
      return {
        tokenMint,
        timestamp: new Date().toISOString(),
        newBuyers: buyTransactions.length,
        sellers: sellTransactions.length,
        netPositiveFlow: totalVolume > 0 ? ((totalBuyVolume - totalSellVolume) / totalVolume) * 100 : 0,
        totalVolume,
        whaleActivity: transactions.data?.filter(t => (t.amount_to || t.amount_from || 0) > 10000).length || 0,
        topHolders: holders.data || [],
        recentActivities: transactions.data || []
      }
    } catch (error) {
      console.error('Error getting token analytics summary:', error)
      return null
    }
  }
}

export const tokenAnalyticsService = new TokenAnalyticsService()