
interface JupiterOrder {
  userPubkey: string
  orderKey: string
  inputMint: string
  outputMint: string
  makingAmount: string
  takingAmount: string
  remainingMakingAmount: string
  remainingTakingAmount: string
  rawMakingAmount: string
  rawTakingAmount: string
  rawRemainingMakingAmount: string
  rawRemainingTakingAmount: string
  slippageBps: string
  slTakingAmount: string
  rawSlTakingAmount: string
  expiredAt: string | null
  createdAt: string
  updatedAt: string
  status: 'Completed' | 'Cancelled' | 'Active' | 'Expired' | 'Open'
  openTx: string
  closeTx: string | null
  programVersion: string
  trades: JupiterTrade[]
}

interface JupiterTrade {
  orderKey: string
  keeper: string
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  rawInputAmount: string
  rawOutputAmount: string
  feeMint: string
  feeAmount: string
  rawFeeAmount: string
  txId: string
  confirmedAt: string
  action: 'Fill'
  productMeta: any
}

interface JupiterOrderHistoryResponse {
  orders: JupiterOrder[]
  totalPages: number
  page: number
  totalItems: number
  user: string
  orderStatus: string
}

export interface ProcessedJupiterOrder {
  orderKey: string
  userPubkey: string
  inputMint: string
  outputMint: string
  inputSymbol: string
  outputSymbol: string
  inputName: string
  outputName: string
  makingAmount: number
  takingAmount: number
  executedAmount: number
  executedValue: number
  status: string
  createdAt: Date
  updatedAt: Date
  tradesCount: number
  openTx: string
  closeTx: string | null
  trades: JupiterTrade[]
  programVersion: string
  protocolName?: string // DEX/protocol name from program version
}

export class JupiterOrderHistoryService {
  private static readonly JUPITER_ORDERS_API = 'https://lite-api.jup.ag/trigger/v1/getTriggerOrders'
  private static orderCache: Map<string, { data: ProcessedJupiterOrder[], timestamp: number }> = new Map()
  private static readonly CACHE_DURATION = 30 * 1000 // 30 seconds

  // Jupiter program ID to DEX name mapping
  private static readonly PROGRAM_ID_TO_LABEL: Record<string, string> = {
    "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY": "Phoenix",
    "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P": "Pump.fun",
    "PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP": "Penguin",
    "REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2": "Byreal",
    "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ": "Saber",
    "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8": "Token Swap",
    "HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq": "PancakeSwap",
    "WooFif76YGRNjk1pA8wCsN67aQsD9f9iLsz4NcJ1AVb": "Woofi",
    "ZERor4xhbUycZ6gb9ntrhqscUcZmAbQDjEAtCf4hbZY": "ZeroFi",
    "srAMMzfVHVAtgSJc8iH6CfKzuWuUTzLHVCE81QU1rgi": "Gavel",
    "CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4": "Aldrin V2",
    "PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu": "Perps",
    "SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr": "Saros",
    "LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj": "Raydium Launchlab",
    "CLMM9tUoggJu2wagPkkqs9eFG4BWhVBZWkP1qv3Sp7tR": "Crema",
    "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA": "Pump.fun Amm",
    "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb": "OpenBook V2",
    "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB": "Meteora",
    "5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx": "Sanctum Infinity",
    "SoLFiHG9TfgtdUXUjWAxi3LtvYuFyDLVhBWxdMZxyCe": "SolFi",
    "9H6tua7jkLhdm3w8BvgpTn5LZNU7g4ZynDmCiNN3q6Rp": "HumidiFi",
    "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN": "Dynamic Bonding Curve",
    "AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6": "Aldrin",
    "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Whirlpool",
    "DecZY86MU5Gj7kppfUCEmd4LbXXuyZH1yHaP2NTqdiZB": "Saber (Decimals)",
    "boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4": "Boop.fun",
    "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo": "Meteora DLMM",
    "MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG": "Moonit",
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": "Orca V2",
    "DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N": "DexLab",
    "goonERTdGsjnkZqWuVjs73BZ3Pb9qoCUdBUL17BnS5j": "GoonFi",
    "obriQD1zbpyLz95G5n7nJe6a4DPjpFwa5XYPoNm113y": "Obric V2",
    "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG": "Meteora DAMM v2",
    "FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X": "FluxBeam",
    "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C": "Raydium CP",
    "endoLNCKTqDn8gSVnN2hDdpgACUPWHZTwoYnnMybpAT": "Solayer",
    "BSwp6bEBihVLdqJRKGgzjcGLHkcTuzmSo1TQkHepzH8p": "Bonkswap",
    "H8W3ctz92svYg6mkn1UtGfu2aQr2fnUFHM1RhScEtQDt": "Cropper",
    "GAMMA7meSFWaBXF25oSUgmGRwaW6sCMFLmBNiMSdbHVT": "GooseFX GAMMA",
    "DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1": "Orca V1",
    "swapFpHZwjELNnjvThjajtiVmkz3yPQEHjLtka2fwHW": "Stabble Weighted Swap",
    "DEXYosS6oEGvk8uCDayvwEZz4qEyDJRf9nFgYCaqPMTm": "1DEX",
    "TessVdML9pBGgG9yGks7o4HewRaXVAMuoVj4x83GLQH": "TesseraV",
    "Gswppe6ERWKpUTXvRPfXdzHhiCyJvLadVvXGfdpBqcE1": "Guacswap",
    "swapNyd8XiQwJ6ianp9snpu4brUqFxadzvHebnAXjJZ": "Stabble Stable Swap",
    "NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P": "Perena",
    "5U3EU2ubXtK84QcRjWVmYt9RaDyA8gKxdUrPFXmZyaki": "Virtuals",
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium",
    "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK": "Raydium CLMM",
    "treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5": "Helium Network",
    "MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky": "Mercurial",
    "HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt": "Invariant",
    "Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j": "StepN",
    "stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq": "Sanctum",
    "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c": "Lifinity V2"
  }

  /**
   * Get order history for a specific wallet
   */
  static async getOrderHistory(
    walletAddress: string, 
    orderStatus: 'history' | 'active' = 'history',
    page: number = 1
  ): Promise<ProcessedJupiterOrder[]> {
    const cacheKey = `${walletAddress}-${orderStatus}-${page}`
    const now = Date.now()
    
    // Check cache first
    const cached = this.orderCache.get(cacheKey)
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`Fetching Jupiter order history for ${walletAddress}...`)
      
      const url = new URL(this.JUPITER_ORDERS_API)
      url.searchParams.set('user', walletAddress)
      url.searchParams.set('orderStatus', orderStatus)
      url.searchParams.set('page', page.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Jupiter Orders API error:', response.status, response.statusText)
        return []
      }

      const data: JupiterOrderHistoryResponse = await response.json()
      const processedOrders = await this.processOrders(data.orders)
      
      // Cache the results
      this.orderCache.set(cacheKey, { data: processedOrders, timestamp: now })
      
      console.log(`Fetched ${processedOrders.length} orders for ${walletAddress}`)
      return processedOrders
    } catch (error) {
      console.error('Error fetching Jupiter order history:', error)
      return []
    }
  }

  /**
   * Get protocol name from program version
   */
  private static getProtocolName(programVersion: string): string | undefined {
    return this.PROGRAM_ID_TO_LABEL[programVersion]
  }

  /**
   * Get order history for multiple wallets with multiple statuses
   */
  static async getOrderHistoryForWallets(
    walletAddresses: string[], 
    orderStatuses: ('history' | 'active')[] = ['history']
  ): Promise<ProcessedJupiterOrder[]> {
    if (walletAddresses.length === 0) return []

    try {
      const orderPromises: Promise<ProcessedJupiterOrder[]>[] = []
      
      // Fetch for each wallet and each status
      walletAddresses.forEach(address => {
        orderStatuses.forEach(status => {
          orderPromises.push(this.getOrderHistory(address, status, 1))
        })
      })
      
      const orderResults = await Promise.all(orderPromises)
      const allOrders = orderResults.flat()
      
      // Remove duplicates based on orderKey and sort by creation date (newest first)
      const uniqueOrders = Array.from(
        new Map(allOrders.map(order => [order.orderKey, order])).values()
      )
      
      return uniqueOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Error fetching order history for multiple wallets:', error)
      return []
    }
  }

  /**
   * Process raw Jupiter orders into displayable format
   */
  private static async processOrders(orders: JupiterOrder[]): Promise<ProcessedJupiterOrder[]> {
    if (orders.length === 0) return []

    // Get all unique mints for metadata lookup
    const mints = new Set<string>()
    orders.forEach(order => {
      mints.add(order.inputMint)
      mints.add(order.outputMint)
    })

    // Import services dynamically to avoid circular dependencies
    const { tokenMetadataService } = await import('./tokenMetadataService')
    const metadata = await tokenMetadataService.getTokensMetadata(Array.from(mints))

    return orders.map(order => {
      const inputMetadata = metadata[order.inputMint]
      const outputMetadata = metadata[order.outputMint]
      
      // Calculate executed amounts
      const makingAmount = parseFloat(order.makingAmount)
      const remainingAmount = parseFloat(order.remainingMakingAmount)
      const executedAmount = makingAmount - remainingAmount
      
      // Calculate executed value from trades
      const executedValue = order.trades.reduce((total, trade) => {
        return total + parseFloat(trade.outputAmount)
      }, 0)

      return {
        orderKey: order.orderKey,
        userPubkey: order.userPubkey,
        inputMint: order.inputMint,
        outputMint: order.outputMint,
        inputSymbol: inputMetadata?.symbol || this.shortenMint(order.inputMint),
        outputSymbol: outputMetadata?.symbol || this.shortenMint(order.outputMint),
        inputName: inputMetadata?.name || 'Unknown Token',
        outputName: outputMetadata?.name || 'Unknown Token',
        makingAmount,
        takingAmount: parseFloat(order.takingAmount),
        executedAmount,
        executedValue,
        status: order.status,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        tradesCount: order.trades.length,
        openTx: order.openTx,
        closeTx: order.closeTx,
        trades: order.trades,
        programVersion: order.programVersion,
        protocolName: this.getProtocolName(order.programVersion)
      }
    })
  }

  /**
   * Shorten mint address for display
   */
  private static shortenMint(mint: string): string {
    if (mint.length <= 8) return mint
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.orderCache.clear()
  }
}

export const jupiterOrderHistoryService = JupiterOrderHistoryService
