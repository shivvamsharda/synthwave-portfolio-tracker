import { supabase } from '@/integrations/supabase/client'
import { solanaService } from './solanaService'

export interface TokenSwapData {
  signature: string
  timestamp: number
  walletAddress: string
  tokenFrom: string
  tokenTo: string
  amountFrom: number
  amountTo: number
  type: 'swap' | 'buy' | 'sell'
}

export interface HolderSnapshot {
  walletAddress: string
  tokenMint: string
  balance: number
  usdValue: number
  timestamp: Date
}

export class TokenAnalyticsService {
  /**
   * Process and store token transaction data
   */
  async processTokenTransaction(txData: TokenSwapData) {
    try {
      const { error } = await supabase
        .from('token_transactions')
        .insert({
          transaction_hash: txData.signature,
          wallet_address: txData.walletAddress,
          token_mint_from: txData.tokenFrom,
          token_mint_to: txData.tokenTo,
          amount_from: txData.amountFrom,
          amount_to: txData.amountTo,
          transaction_type: txData.type,
          timestamp: new Date(txData.timestamp).toISOString(),
          block_height: null // Would need to get from transaction data
        })

      if (error) {
        console.error('Error storing transaction:', error)
      }
    } catch (error) {
      console.error('Error processing transaction:', error)
    }
  }

  /**
   * Update holder rankings for a token
   */
  async updateTokenHolders(tokenMint: string, holders: HolderSnapshot[]) {
    try {
      // Sort holders by balance to assign ranks
      const sortedHolders = holders.sort((a, b) => b.balance - a.balance)
      
      // Calculate total supply for percentage calculations
      const totalSupply = sortedHolders.reduce((sum, holder) => sum + holder.balance, 0)
      
      const holderData = sortedHolders.map((holder, index) => ({
        token_mint: tokenMint,
        wallet_address: holder.walletAddress,
        balance: holder.balance,
        usd_value: holder.usdValue,
        percentage_of_supply: totalSupply > 0 ? (holder.balance / totalSupply) * 100 : 0,
        holder_rank: index + 1,
        last_updated: new Date().toISOString()
      }))

      // Use upsert to update existing holders or insert new ones
      const { error } = await supabase
        .from('token_holders')
        .upsert(holderData, {
          onConflict: 'token_mint,wallet_address',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error updating token holders:', error)
        throw error
      }

      return holderData.length
    } catch (error) {
      console.error('Error updating token holders:', error)
      throw error
    }
  }

  /**
   * Analyze token flow patterns
   */
  async analyzeTokenFlows(tokenMint: string, timePeriod: string) {
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timePeriod) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        default:
          startDate.setDate(startDate.getDate() - 7)
      }

      // Get transactions for the period
      const { data: transactions, error } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (error) {
        console.error('Error fetching transactions for flow analysis:', error)
        return
      }

      // Analyze inflows (what people sold to buy this token)
      const inflows = new Map<string, { volume: number, wallets: Set<string> }>()
      const outflows = new Map<string, { volume: number, wallets: Set<string> }>()

      transactions?.forEach(tx => {
        if (tx.token_mint_to === tokenMint && tx.token_mint_from) {
          // Someone bought this token by selling another token
          const current = inflows.get(tx.token_mint_from) || { volume: 0, wallets: new Set() }
          current.volume += tx.amount_from || 0
          current.wallets.add(tx.wallet_address)
          inflows.set(tx.token_mint_from, current)
        } else if (tx.token_mint_from === tokenMint && tx.token_mint_to) {
          // Someone sold this token to buy another token
          const current = outflows.get(tx.token_mint_to) || { volume: 0, wallets: new Set() }
          current.volume += tx.amount_to || 0
          current.wallets.add(tx.wallet_address)
          outflows.set(tx.token_mint_to, current)
        }
      })

      // Store inflow analysis
      for (const [sourceToken, data] of inflows.entries()) {
        await supabase
          .from('token_flow_analysis')
          .upsert({
            token_mint: tokenMint,
            flow_direction: 'in',
            source_token: sourceToken,
            destination_token: null,
            total_volume: data.volume,
            unique_wallets: data.wallets.size,
            time_period: timePeriod,
            analysis_date: new Date().toISOString()
          })
      }

      // Store outflow analysis
      for (const [destinationToken, data] of outflows.entries()) {
        await supabase
          .from('token_flow_analysis')
          .upsert({
            token_mint: tokenMint,
            flow_direction: 'out',
            source_token: null,
            destination_token: destinationToken,
            total_volume: data.volume,
            unique_wallets: data.wallets.size,
            time_period: timePeriod,
            analysis_date: new Date().toISOString()
          })
      }

      return {
        inflows: Array.from(inflows.entries()).map(([token, data]) => ({
          token,
          volume: data.volume,
          uniqueWallets: data.wallets.size
        })),
        outflows: Array.from(outflows.entries()).map(([token, data]) => ({
          token,
          volume: data.volume,
          uniqueWallets: data.wallets.size
        }))
      }
    } catch (error) {
      console.error('Error analyzing token flows:', error)
      throw error
    }
  }

  /**
   * Get comprehensive token analysis
   */
  async getTokenAnalysis(tokenMint: string) {
    try {
      // Get current holders
      const { data: holders } = await supabase
        .from('token_holders')
        .select('*')
        .eq('token_mint', tokenMint)
        .order('holder_rank', { ascending: true })
        .limit(100)

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .order('timestamp', { ascending: false })
        .limit(50)

      // Get flow analysis
      const { data: flows } = await supabase
        .from('token_flow_analysis')
        .select('*')
        .eq('token_mint', tokenMint)
        .order('analysis_date', { ascending: false })
        .limit(20)

      return {
        holders: holders || [],
        recentTransactions: recentTransactions || [],
        flows: flows || []
      }
    } catch (error) {
      console.error('Error getting token analysis:', error)
      throw error
    }
  }

  /**
   * Detect whale movements based on threshold
   */
  async detectWhaleMovements(tokenMint: string, minUsdValue: number, timeframe: string = '24h') {
    try {
      const startDate = new Date()
      if (timeframe === '24h') {
        startDate.setHours(startDate.getHours() - 24)
      } else if (timeframe === '7d') {
        startDate.setDate(startDate.getDate() - 7)
      }

      // Get large transactions
      const { data: transactions, error } = await supabase
        .from('token_transactions')
        .select(`
          *,
          token_holders!inner(usd_value)
        `)
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error detecting whale movements:', error)
        return []
      }

      // Filter for whale-sized transactions
      const whaleMovements = transactions?.filter(tx => {
        // This would need price data to properly calculate USD value
        // For now, we'll use the holder's USD value as a proxy
        return true // Placeholder
      }) || []

      return whaleMovements
    } catch (error) {
      console.error('Error detecting whale movements:', error)
      return []
    }
  }
}

// Export singleton instance
export const tokenAnalyticsService = new TokenAnalyticsService()