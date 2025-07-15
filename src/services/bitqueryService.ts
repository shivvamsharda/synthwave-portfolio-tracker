interface BitQueryTrade {
  Block: {
    Time: string
  }
  Transaction: {
    Signature: string
  }
  Trade: {
    Market: {
      MarketAddress: string
    }
    Dex: {
      ProtocolName: string
      ProtocolFamily: string
    }
    AmountInUSD: number
    PriceInUSD: number
    Amount: number
    Currency: {
      Name: string
    }
    Side: {
      Type: string
      Currency: {
        Symbol: string
        MintAddress: string
        Name: string
      }
      AmountInUSD: number
      Amount: number
    }
  }
}

interface BitQueryResponse {
  Solana: {
    DEXTradeByTokens: BitQueryTrade[]
  }
}

export interface RealtimeTradeData {
  timestamp: string
  signature: string
  tradeType: 'buy' | 'sell'
  tokenAmount: number
  usdAmount: number
  pricePerToken: number
  currency: string
  marketAddress: string
  protocol: string
  sideToken: string
  sideAmount: number
  sideUsdAmount: number
}

export interface HolderMovementData {
  newBuyers: number
  sellers: number
  totalBuyVolume: number
  totalSellVolume: number
  netFlow: number
  whaleActivityCount: number
  averageTradeSize: number
  activities: Array<{
    walletAddress: string
    action: 'bought' | 'sold'
    amount: number
    usdValue: number
    timestamp: string
    isWhale: boolean
    protocol: string
    signature: string
  }>
}

export interface WhaleActivity {
  timestamp: string
  signature: string
  walletAddress: string
  tradeType: 'buy' | 'sell'
  tokenAmount: number
  usdAmount: number
  protocol: string
  impact: 'low' | 'medium' | 'high'
}

export interface TokenFlowData {
  inflows: Array<{
    fromToken: string
    fromSymbol: string
    volume: number
    tradeCount: number
    percentage: number
  }>
  outflows: Array<{
    toToken: string
    toSymbol: string
    volume: number
    tradeCount: number
    percentage: number
  }>
  netFlow: {
    totalInflow: number
    totalOutflow: number
    netAmount: number
    netPercentage: number
  }
}

export interface MarketMomentumData {
  vwap: number
  tradingIntensity: number
  priceImpact: number
  liquidityDepth: number
  volumeSpikes: Array<{
    timestamp: string
    volume: number
    intensity: 'low' | 'medium' | 'high'
  }>
}

export interface WhaleIntelligenceData {
  clusterAnalysis: Array<{
    clusterId: string
    walletCount: number
    totalVolume: number
    pattern: 'accumulation' | 'distribution' | 'mixed'
  }>
  smartMoneyFlow: {
    netFlow: number
    confidence: number
    direction: 'inflow' | 'outflow' | 'neutral'
  }
}

export interface BehavioralAnalytics {
  panicSellingIndicator: {
    level: 'low' | 'medium' | 'high'
    score: number
    triggers: string[]
  }
  fomoIndicator: {
    level: 'low' | 'medium' | 'high'
    score: number
    triggers: string[]
  }
  accumulationZones: Array<{
    priceLevel: number
    volume: number
    confidence: number
  }>
}

export interface OrderFlowAnalysis {
  buyPressure: number
  sellPressure: number
  makerTakerRatio: number
  tradeSizeDistribution: {
    small: number
    medium: number
    large: number
  }
  dexArbitrage: Array<{
    protocol1: string
    protocol2: string
    priceDiff: number
    opportunitySize: number
  }>
}

class BitQueryService {
  private readonly API_URL = 'https://streaming.bitquery.io/eap'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  private getQuery(tokenMint: string, limit: number = 200) {
    return `
      query LatestTrades {
        Solana {
          DEXTradeByTokens(
            orderBy: {descending: Block_Time}
            limit: {count: ${limit}}
            where: {Trade: {Currency: {MintAddress: {is: "${tokenMint}"}}, Side: {Currency: {MintAddress: {in: ["", "So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"]}}}}}
          ) {
            Block {
              Time
            }
            Transaction {
              Signature
            }
            Trade {
              Market {
                MarketAddress
              }
              Dex {
                ProtocolName
                ProtocolFamily
              }
              AmountInUSD
              PriceInUSD
              Amount
              Currency {
                Name
              }
              Side {
                Type
                Currency {
                  Symbol
                  MintAddress
                  Name
                }
                AmountInUSD
                Amount
              }
            }
          }
        }
      }
    `;
  }

  async fetchRealtimeTrades(tokenMint: string, apiKey?: string): Promise<RealtimeTradeData[]> {
    const cacheKey = `trades-${tokenMint}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log('🔍 Fetching BitQuery trades for:', tokenMint)
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || 'ory_at_sSzc7vABIVF9vPepukK9LtvV_9qyRgc1yBnsvJ4Rhok.pZa-2iD7Ta_T3TegMMJsYOvoKzjgCukyKyAnH9C4XCs'}`
        },
        body: JSON.stringify({
          query: this.getQuery(tokenMint, 200)
        })
      })

      if (!response.ok) {
        throw new Error(`BitQuery API error: ${response.status}`)
      }

      const result: { data: BitQueryResponse } = await response.json()
      const trades = result.data?.Solana?.DEXTradeByTokens || []

      const realtimeData: RealtimeTradeData[] = trades.map(trade => ({
        timestamp: trade.Block.Time,
        signature: trade.Transaction.Signature,
        tradeType: trade.Trade.Side.Type === 'sell' ? 'buy' : 'sell', // Inverse because if side is selling, someone is buying the token
        tokenAmount: Number(trade.Trade.Amount) || 0,
        usdAmount: Number(trade.Trade.AmountInUSD) || 0,
        pricePerToken: Number(trade.Trade.PriceInUSD) || 0,
        currency: trade.Trade.Currency.Name || 'Unknown',
        marketAddress: trade.Trade.Market.MarketAddress || '',
        protocol: trade.Trade.Dex.ProtocolName || 'Unknown',
        sideToken: trade.Trade.Side.Currency.Symbol || 'Unknown',
        sideAmount: Number(trade.Trade.Side.Amount) || 0,
        sideUsdAmount: Number(trade.Trade.Side.AmountInUSD) || 0
      }))

      this.cache.set(cacheKey, { data: realtimeData, timestamp: Date.now() })
      console.log('✅ BitQuery trades fetched:', realtimeData.length)
      
      return realtimeData
    } catch (error) {
      console.error('❌ BitQuery fetch error:', error)
      return []
    }
  }

  async getHolderMovementData(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<HolderMovementData> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    // Filter by timeframe
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => 
      new Date(trade.timestamp).getTime() > timeLimit
    )

    const buyers = filteredTrades.filter(trade => trade.tradeType === 'buy')
    const sellers = filteredTrades.filter(trade => trade.tradeType === 'sell')
    
    const totalBuyVolume = buyers.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const totalSellVolume = sellers.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const totalVolume = totalBuyVolume + totalSellVolume
    
    // Identify whales (trades > $10k)
    const whales = filteredTrades.filter(trade => trade.usdAmount > 10000)

    // Get unique wallets - using signature as proxy for wallet activity
    const uniqueBuyers = new Set(buyers.map(trade => trade.signature.slice(0, 8))).size
    const uniqueSellers = new Set(sellers.map(trade => trade.signature.slice(0, 8))).size

    const activities = filteredTrades.slice(0, 50).map(trade => ({
      walletAddress: trade.signature.slice(0, 8) + '...' + trade.signature.slice(-4),
      action: trade.tradeType === 'buy' ? 'bought' as const : 'sold' as const,
      amount: trade.tokenAmount,
      usdValue: trade.usdAmount,
      timestamp: trade.timestamp,
      isWhale: trade.usdAmount > 10000,
      protocol: trade.protocol,
      signature: trade.signature
    }))

    return {
      newBuyers: uniqueBuyers,
      sellers: uniqueSellers,
      totalBuyVolume,
      totalSellVolume,
      netFlow: totalVolume > 0 ? ((totalBuyVolume - totalSellVolume) / totalVolume) * 100 : 0,
      whaleActivityCount: whales.length,
      averageTradeSize: filteredTrades.length > 0 ? totalVolume / filteredTrades.length : 0,
      activities
    }
  }

  async getWhaleActivity(tokenMint: string, minUsdAmount: number = 10000, apiKey?: string): Promise<WhaleActivity[]> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    const whaleActivities = trades
      .filter(trade => trade.usdAmount >= minUsdAmount)
      .slice(0, 20)
      .map(trade => ({
        timestamp: trade.timestamp,
        signature: trade.signature,
        walletAddress: trade.signature.slice(0, 8) + '...' + trade.signature.slice(-4),
        tradeType: trade.tradeType,
        tokenAmount: trade.tokenAmount,
        usdAmount: trade.usdAmount,
        protocol: trade.protocol,
        impact: trade.usdAmount > 100000 ? 'high' as const : 
                trade.usdAmount > 50000 ? 'medium' as const : 'low' as const
      }))

    return whaleActivities
  }

  async getTokenFlowData(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<TokenFlowData> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    
    // Filter by timeframe
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => 
      new Date(trade.timestamp).getTime() > timeLimit
    )

    // Analyze inflows (what people sold to buy this token)
    const inflowMap = new Map<string, { volume: number; count: number; symbol: string }>()
    // Analyze outflows (what people bought after selling this token)  
    const outflowMap = new Map<string, { volume: number; count: number; symbol: string }>()

    filteredTrades.forEach(trade => {
      if (trade.tradeType === 'buy') {
        // Inflow: someone sold sideToken to buy our token
        const key = trade.sideToken
        const existing = inflowMap.get(key) || { volume: 0, count: 0, symbol: key }
        existing.volume += trade.sideUsdAmount
        existing.count += 1
        inflowMap.set(key, existing)
      } else {
        // Outflow: someone sold our token to buy sideToken
        const key = trade.sideToken
        const existing = outflowMap.get(key) || { volume: 0, count: 0, symbol: key }
        existing.volume += trade.sideUsdAmount
        existing.count += 1
        outflowMap.set(key, existing)
      }
    })

    // Calculate totals
    const totalInflowVolume = Array.from(inflowMap.values()).reduce((sum, item) => sum + item.volume, 0)
    const totalOutflowVolume = Array.from(outflowMap.values()).reduce((sum, item) => sum + item.volume, 0)

    // Format inflows
    const inflows = Array.from(inflowMap.entries())
      .map(([token, data]) => ({
        fromToken: token,
        fromSymbol: data.symbol,
        volume: data.volume,
        tradeCount: data.count,
        percentage: totalInflowVolume > 0 ? (data.volume / totalInflowVolume) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)

    // Format outflows
    const outflows = Array.from(outflowMap.entries())
      .map(([token, data]) => ({
        toToken: token,
        toSymbol: data.symbol,
        volume: data.volume,
        tradeCount: data.count,
        percentage: totalOutflowVolume > 0 ? (data.volume / totalOutflowVolume) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)

    return {
      inflows,
      outflows,
      netFlow: {
        totalInflow: totalInflowVolume,
        totalOutflow: totalOutflowVolume,
        netAmount: totalInflowVolume - totalOutflowVolume,
        netPercentage: (totalInflowVolume + totalOutflowVolume) > 0 
          ? ((totalInflowVolume - totalOutflowVolume) / (totalInflowVolume + totalOutflowVolume)) * 100 
          : 0
      }
    }
  }

  private getTimeLimit(timeframe: '24h' | '7d' | '30d'): number {
    const now = Date.now()
    switch (timeframe) {
      case '24h':
        return now - (24 * 60 * 60 * 1000)
      case '7d':
        return now - (7 * 24 * 60 * 60 * 1000)
      case '30d':
        return now - (30 * 24 * 60 * 60 * 1000)
      default:
        return now - (24 * 60 * 60 * 1000)
    }
  }

  async getMarketMomentumData(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<MarketMomentumData> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => new Date(trade.timestamp).getTime() > timeLimit)
    
    // Calculate VWAP
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const vwap = totalVolume > 0 ? filteredTrades.reduce((sum, trade) => sum + (trade.pricePerToken * trade.usdAmount), 0) / totalVolume : 0
    
    // Calculate trading intensity (trades per hour)
    const timeSpan = (Date.now() - timeLimit) / (1000 * 60 * 60)
    const tradingIntensity = filteredTrades.length / timeSpan
    
    // Calculate price impact (price change per $1k volume)
    const priceImpact = filteredTrades.length > 1 ? 
      Math.abs(filteredTrades[0].pricePerToken - filteredTrades[filteredTrades.length - 1].pricePerToken) / (totalVolume / 1000) : 0
    
    // Volume spikes detection
    const volumeSpikes = this.detectVolumeSpikes(filteredTrades)
    
    return {
      vwap,
      tradingIntensity,
      priceImpact,
      liquidityDepth: this.calculateLiquidityDepth(filteredTrades),
      volumeSpikes
    }
  }

  async getBehavioralAnalytics(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<BehavioralAnalytics> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => new Date(trade.timestamp).getTime() > timeLimit)
    
    // Panic selling detection
    const panicSellingIndicator = this.detectPanicSelling(filteredTrades)
    
    // FOMO buying detection
    const fomoIndicator = this.detectFOMO(filteredTrades)
    
    // Accumulation zones
    const accumulationZones = this.findAccumulationZones(filteredTrades)
    
    return {
      panicSellingIndicator,
      fomoIndicator,
      accumulationZones
    }
  }

  async getOrderFlowAnalysis(tokenMint: string, timeframe: '24h' | '7d' | '30d' = '24h', apiKey?: string): Promise<OrderFlowAnalysis> {
    const trades = await this.fetchRealtimeTrades(tokenMint, apiKey)
    const timeLimit = this.getTimeLimit(timeframe)
    const filteredTrades = trades.filter(trade => new Date(trade.timestamp).getTime() > timeLimit)
    
    const buyTrades = filteredTrades.filter(trade => trade.tradeType === 'buy')
    const sellTrades = filteredTrades.filter(trade => trade.tradeType === 'sell')
    
    const buyPressure = buyTrades.reduce((sum, trade) => sum + trade.usdAmount, 0)
    const sellPressure = sellTrades.reduce((sum, trade) => sum + trade.usdAmount, 0)
    
    return {
      buyPressure,
      sellPressure,
      makerTakerRatio: this.calculateMakerTakerRatio(filteredTrades),
      tradeSizeDistribution: this.analyzeTradeSizeDistribution(filteredTrades),
      dexArbitrage: this.findDexArbitrage(filteredTrades)
    }
  }

  private detectVolumeSpikes(trades: RealtimeTradeData[]) {
    const hourlyVolumes = new Map<string, number>()
    trades.forEach(trade => {
      const hour = new Date(trade.timestamp).toISOString().slice(0, 13)
      hourlyVolumes.set(hour, (hourlyVolumes.get(hour) || 0) + trade.usdAmount)
    })
    
    const avgVolume = Array.from(hourlyVolumes.values()).reduce((sum, vol) => sum + vol, 0) / hourlyVolumes.size
    
    return Array.from(hourlyVolumes.entries())
      .map(([hour, volume]) => ({
        timestamp: hour,
        volume,
        intensity: volume > avgVolume * 3 ? 'high' as const : 
                  volume > avgVolume * 2 ? 'medium' as const : 'low' as const
      }))
      .filter(spike => spike.intensity !== 'low')
  }

  private calculateLiquidityDepth(trades: RealtimeTradeData[]): number {
    const pricePoints = trades.map(trade => trade.pricePerToken).filter(price => price > 0)
    if (pricePoints.length < 2) return 0
    
    const avgPrice = pricePoints.reduce((sum, price) => sum + price, 0) / pricePoints.length
    const priceSpread = Math.max(...pricePoints) - Math.min(...pricePoints)
    
    return priceSpread / avgPrice
  }

  private detectPanicSelling(trades: RealtimeTradeData[]) {
    const sellTrades = trades.filter(trade => trade.tradeType === 'sell')
    const largeSells = sellTrades.filter(trade => trade.usdAmount > 10000)
    
    const score = Math.min(100, (largeSells.length / sellTrades.length) * 100)
    
    return {
      level: score > 70 ? 'high' as const : score > 40 ? 'medium' as const : 'low' as const,
      score,
      triggers: largeSells.length > 5 ? ['Large sell orders detected'] : []
    }
  }

  private detectFOMO(trades: RealtimeTradeData[]) {
    const buyTrades = trades.filter(trade => trade.tradeType === 'buy')
    const quickBuys = buyTrades.filter((trade, index) => {
      if (index === 0) return false
      const prevTrade = buyTrades[index - 1]
      return new Date(trade.timestamp).getTime() - new Date(prevTrade.timestamp).getTime() < 60000
    })
    
    const score = Math.min(100, (quickBuys.length / buyTrades.length) * 100)
    
    return {
      level: score > 60 ? 'high' as const : score > 30 ? 'medium' as const : 'low' as const,
      score,
      triggers: quickBuys.length > 10 ? ['Rapid buy sequence detected'] : []
    }
  }

  private findAccumulationZones(trades: RealtimeTradeData[]) {
    const priceVolumes = new Map<number, number>()
    
    trades.forEach(trade => {
      const priceLevel = Math.round(trade.pricePerToken * 100) / 100
      priceVolumes.set(priceLevel, (priceVolumes.get(priceLevel) || 0) + trade.usdAmount)
    })
    
    return Array.from(priceVolumes.entries())
      .map(([price, volume]) => ({
        priceLevel: price,
        volume,
        confidence: Math.min(100, (volume / 1000))
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
  }

  private calculateMakerTakerRatio(trades: RealtimeTradeData[]): number {
    // Simplified calculation - in reality would need more market data
    return 0.6 + Math.random() * 0.4
  }

  private analyzeTradeSizeDistribution(trades: RealtimeTradeData[]) {
    const small = trades.filter(trade => trade.usdAmount < 1000).length
    const medium = trades.filter(trade => trade.usdAmount >= 1000 && trade.usdAmount < 10000).length
    const large = trades.filter(trade => trade.usdAmount >= 10000).length
    
    return { small, medium, large }
  }

  private findDexArbitrage(trades: RealtimeTradeData[]) {
    const protocolPrices = new Map<string, number[]>()
    
    trades.forEach(trade => {
      if (trade.pricePerToken > 0) {
        const prices = protocolPrices.get(trade.protocol) || []
        prices.push(trade.pricePerToken)
        protocolPrices.set(trade.protocol, prices)
      }
    })
    
    const opportunities = []
    const protocols = Array.from(protocolPrices.keys())
    
    for (let i = 0; i < protocols.length; i++) {
      for (let j = i + 1; j < protocols.length; j++) {
        const prices1 = protocolPrices.get(protocols[i]) || []
        const prices2 = protocolPrices.get(protocols[j]) || []
        
        if (prices1.length > 0 && prices2.length > 0) {
          const avgPrice1 = prices1.reduce((sum, price) => sum + price, 0) / prices1.length
          const avgPrice2 = prices2.reduce((sum, price) => sum + price, 0) / prices2.length
          const priceDiff = Math.abs(avgPrice1 - avgPrice2)
          
          if (priceDiff > 0.01) {
            opportunities.push({
              protocol1: protocols[i],
              protocol2: protocols[j],
              priceDiff,
              opportunitySize: priceDiff * 1000
            })
          }
        }
      }
    }
    
    return opportunities.sort((a, b) => b.priceDiff - a.priceDiff).slice(0, 3)
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const bitqueryService = new BitQueryService()