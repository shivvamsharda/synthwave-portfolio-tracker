import { supabase } from "@/integrations/supabase/client"

export interface PortfolioHistoryPoint {
  date: string
  value: number
  change24h?: number
  changePercentage24h?: number
}

export class PortfolioHistoryService {
  /**
   * Get portfolio history data for charting
   */
  static async getPortfolioHistory(
    userId: string, 
    days: number = 30
  ): Promise<PortfolioHistoryPoint[]> {
    try {
      const { data, error } = await supabase
        .from('portfolio_history')
        .select('*')
        .eq('user_id', userId)
        .gte('snapshot_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('snapshot_date', { ascending: true })

      if (error) {
        console.error('Error fetching portfolio history:', error)
        return []
      }

      return data.map(point => ({
        date: point.snapshot_date,
        value: Number(point.total_value || 0),
        change24h: Number(point.total_value_change_24h || 0),
        changePercentage24h: Number(point.total_value_change_percentage_24h || 0)
      }))
    } catch (error) {
      console.error('Error in getPortfolioHistory:', error)
      return []
    }
  }

  /**
   * Save current portfolio snapshot
   */
  static async savePortfolioSnapshot(
    userId: string,
    totalValue: number,
    totalAssets: number,
    valueChange24h?: number,
    valueChangePercentage24h?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('portfolio_history')
        .insert({
          user_id: userId,
          total_value: totalValue,
          total_assets: totalAssets,
          total_value_change_24h: valueChange24h || 0,
          total_value_change_percentage_24h: valueChangePercentage24h || 0
        })

      if (error) {
        console.error('Error saving portfolio snapshot:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in savePortfolioSnapshot:', error)
      return false
    }
  }

  /**
   * Clean up old history data (keep only last 90 days)
   */
  static async cleanupOldHistory(userId: string): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      
      const { error } = await supabase
        .from('portfolio_history')
        .delete()
        .eq('user_id', userId)
        .lt('snapshot_date', cutoffDate)

      if (error) {
        console.error('Error cleaning up old history:', error)
      }
    } catch (error) {
      console.error('Error in cleanupOldHistory:', error)
    }
  }

  /**
   * Get portfolio performance metrics
   */
  static async getPerformanceMetrics(userId: string) {
    try {
      const history = await this.getPortfolioHistory(userId, 30)
      
      if (history.length < 2) {
        return {
          totalReturn: 0,
          totalReturnPercentage: 0,
          bestDay: 0,
          worstDay: 0,
          averageDailyReturn: 0,
          volatility: 0
        }
      }

      const firstValue = history[0].value
      const lastValue = history[history.length - 1].value
      const totalReturn = lastValue - firstValue
      const totalReturnPercentage = firstValue > 0 ? (totalReturn / firstValue) * 100 : 0

      // Calculate daily returns
      const dailyReturns = []
      for (let i = 1; i < history.length; i++) {
        const prevValue = history[i - 1].value
        const currentValue = history[i].value
        if (prevValue > 0) {
          const dailyReturn = ((currentValue - prevValue) / prevValue) * 100
          dailyReturns.push(dailyReturn)
        }
      }

      const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0
      const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0
      const averageDailyReturn = dailyReturns.length > 0 
        ? dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length 
        : 0

      // Calculate volatility (standard deviation)
      let volatility = 0
      if (dailyReturns.length > 1) {
        const variance = dailyReturns.reduce((sum, ret) => 
          sum + Math.pow(ret - averageDailyReturn, 2), 0
        ) / (dailyReturns.length - 1)
        volatility = Math.sqrt(variance)
      }

      return {
        totalReturn,
        totalReturnPercentage,
        bestDay,
        worstDay,
        averageDailyReturn,
        volatility
      }
    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        bestDay: 0,
        worstDay: 0,
        averageDailyReturn: 0,
        volatility: 0
      }
    }
  }
}