import { supabase } from "@/integrations/supabase/client"

export interface WhaleHolder {
  id: string
  wallet_address: string
  balance: number
  usd_value: number | null
  percentage_of_supply: number | null
  holder_rank: number | null
  token_mint: string
  last_updated: string
  change_24h?: number
  tags?: string[]
}

export interface WhaleActivity {
  id: string
  transaction_hash: string
  wallet_address: string
  transaction_type: string
  amount_from: number | null
  amount_to: number | null
  token_mint_from: string | null
  token_mint_to: string | null
  timestamp: string
  usd_value?: number
  impact_level?: 'low' | 'medium' | 'high'
}

export interface WhaleStats {
  total_whales: number
  new_this_week: number
  whale_dominance: number
  active_alerts: number
}

export interface ConcentrationData {
  top_10_percentage: number
  top_50_percentage: number
  top_100_percentage: number
  risk_level: 'low' | 'medium' | 'high'
}

class WhaleTrackingService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 30000 // 30 seconds

  async getTopHolders(tokenMint: string, limit: number = 50, minUsdValue: number = 100000): Promise<WhaleHolder[]> {
    const cacheKey = `holders-${tokenMint}-${limit}-${minUsdValue}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      let query = supabase
        .from('token_holders')
        .select('*')
        .eq('token_mint', tokenMint)
        .order('balance', { ascending: false })
        .limit(limit)

      if (minUsdValue > 0) {
        query = query.gte('usd_value', minUsdValue)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching top holders:', error)
        return []
      }

      // Add mock tags and change data for demonstration
      const enrichedData: WhaleHolder[] = (data || []).map((holder, index) => ({
        ...holder,
        change_24h: (Math.random() - 0.5) * 40, // Random change between -20% and +20%
        tags: this.generateWhaleTags(holder, index)
      }))

      this.cache.set(cacheKey, { data: enrichedData, timestamp: Date.now() })
      return enrichedData
    } catch (error) {
      console.error('Error fetching whale holders:', error)
      return []
    }
  }

  async getWhaleActivity(tokenMint: string, limit: number = 20): Promise<WhaleActivity[]> {
    const cacheKey = `activity-${tokenMint}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`token_mint_from.eq.${tokenMint},token_mint_to.eq.${tokenMint}`)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching whale activity:', error)
        return []
      }

      const enrichedData: WhaleActivity[] = (data || []).map(tx => ({
        ...tx,
        usd_value: this.calculateUsdValue(tx),
        impact_level: this.calculateImpactLevel(tx)
      }))

      this.cache.set(cacheKey, { data: enrichedData, timestamp: Date.now() })
      return enrichedData
    } catch (error) {
      console.error('Error fetching whale activity:', error)
      return []
    }
  }

  async getWhaleStats(tokenMint: string): Promise<WhaleStats> {
    const cacheKey = `stats-${tokenMint}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      // Get total whales (holders with significant value)
      const { data: totalWhalesData, error: totalError } = await supabase
        .from('token_holders')
        .select('id', { count: 'exact', head: true })
        .eq('token_mint', tokenMint)
        .gte('usd_value', 100000)

      if (totalError) throw totalError

      // Get new whales this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data: newWhalesData, error: newError } = await supabase
        .from('token_holders')
        .select('id', { count: 'exact', head: true })
        .eq('token_mint', tokenMint)
        .gte('usd_value', 100000)
        .gte('created_at', oneWeekAgo.toISOString())

      if (newError) throw newError

      // Calculate whale dominance
      const { data: allHolders, error: holdersError } = await supabase
        .from('token_holders')
        .select('balance, usd_value')
        .eq('token_mint', tokenMint)

      if (holdersError) throw holdersError

      const totalSupply = (allHolders || []).reduce((sum, holder) => sum + holder.balance, 0)
      const whaleSupply = (allHolders || [])
        .filter(holder => (holder.usd_value || 0) >= 100000)
        .reduce((sum, holder) => sum + holder.balance, 0)

      const whaleDominance = totalSupply > 0 ? (whaleSupply / totalSupply) * 100 : 0

      const stats: WhaleStats = {
        total_whales: totalWhalesData?.length || 0,
        new_this_week: newWhalesData?.length || 0,
        whale_dominance: whaleDominance,
        active_alerts: Math.floor(Math.random() * 10) // Mock alerts for now
      }

      this.cache.set(cacheKey, { data: stats, timestamp: Date.now() })
      return stats
    } catch (error) {
      console.error('Error fetching whale stats:', error)
      return {
        total_whales: 0,
        new_this_week: 0,
        whale_dominance: 0,
        active_alerts: 0
      }
    }
  }

  async getConcentrationData(tokenMint: string): Promise<ConcentrationData> {
    const cacheKey = `concentration-${tokenMint}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const { data: holders, error } = await supabase
        .from('token_holders')
        .select('balance, percentage_of_supply')
        .eq('token_mint', tokenMint)
        .order('balance', { ascending: false })
        .limit(100)

      if (error) throw error

      const top10 = (holders || []).slice(0, 10)
      const top50 = (holders || []).slice(0, 50)
      const top100 = holders || []

      const top10Percentage = top10.reduce((sum, h) => sum + (h.percentage_of_supply || 0), 0)
      const top50Percentage = top50.reduce((sum, h) => sum + (h.percentage_of_supply || 0), 0)
      const top100Percentage = top100.reduce((sum, h) => sum + (h.percentage_of_supply || 0), 0)

      const riskLevel: 'low' | 'medium' | 'high' = 
        top50Percentage > 70 ? 'high' :
        top50Percentage > 50 ? 'medium' : 'low'

      const concentrationData: ConcentrationData = {
        top_10_percentage: top10Percentage,
        top_50_percentage: top50Percentage,
        top_100_percentage: top100Percentage,
        risk_level: riskLevel
      }

      this.cache.set(cacheKey, { data: concentrationData, timestamp: Date.now() })
      return concentrationData
    } catch (error) {
      console.error('Error fetching concentration data:', error)
      return {
        top_10_percentage: 0,
        top_50_percentage: 0,
        top_100_percentage: 0,
        risk_level: 'low'
      }
    }
  }

  private generateWhaleTags(holder: any, index: number): string[] {
    const tags: string[] = []
    
    if (index === 0) tags.push('Smart Money')
    if ((holder.percentage_of_supply || 0) > 2) tags.push('Early Holder')
    if ((holder.usd_value || 0) > 1000000) tags.push('Whale')
    if ((holder.usd_value || 0) > 500000 && (holder.usd_value || 0) < 1000000) tags.push('Diamond Hands')
    if (index < 5 && Math.random() > 0.7) tags.push('Alert')
    
    return tags.length > 0 ? tags : ['Holder']
  }

  private calculateUsdValue(tx: any): number {
    // Mock USD value calculation - in real implementation, would use token price
    const amount = tx.amount_to || tx.amount_from || 0
    return amount * 0.03 // Assuming ~$0.03 per token for demo
  }

  private calculateImpactLevel(tx: any): 'low' | 'medium' | 'high' {
    const usdValue = this.calculateUsdValue(tx)
    if (usdValue > 50000) return 'high'
    if (usdValue > 20000) return 'medium'
    return 'low'
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const whaleTrackingService = new WhaleTrackingService()