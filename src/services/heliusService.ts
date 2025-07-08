export interface HeliusTokenData {
  id: string
  content: {
    $schema: string
    json_uri: string
    metadata: {
      name: string
      symbol: string
      description?: string
      image?: string
      external_url?: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
    }
  }
  authorities: {
    metadata: string
    mint: string
  }
  compression: {
    eligible: boolean
    compressed: boolean
  }
  grouping: Array<{
    group_key: string
    group_value: string
  }>
  royalty: {
    royalty_model: string
    target?: string
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  creators: Array<{
    address: string
    share: number
    verified: boolean
  }>
  ownership: {
    frozen: boolean
    delegated: boolean
    delegate?: string
    ownership_model: string
    owner: string
  }
  supply: {
    print_max_supply: number
    print_current_supply: number
    edition_nonce: number
  }
  mutable: boolean
  burnt: boolean
}

export interface HeliusTransactionData {
  blockTime: number
  slot: number
  txHash: string
  indexWithinBlock: number
  instructionIndex: number
  innerInstructionIndex: number
  source: string
  type: string
  accountData: Array<{
    account: string
    nativeBalanceChange: number
    tokenBalanceChanges: Array<{
      mint: string
      rawTokenAmount: {
        tokenAmount: string
        decimals: number
      }
      tokenAccount: string
      userAccount: string
    }>
  }>
  events: {
    swap?: {
      nativeInput: {
        amount: string
        account: string
      }
      nativeOutput: {
        amount: string
        account: string
      }
      tokenInputs: Array<{
        mint: string
        rawTokenAmount: {
          tokenAmount: string
          decimals: number
        }
        tokenAccount: string
        userAccount: string
      }>
      tokenOutputs: Array<{
        mint: string
        rawTokenAmount: {
          tokenAmount: string
          decimals: number
        }
        tokenAccount: string
        userAccount: string
      }>
    }
  }
}

class HeliusService {
  private baseUrl = 'https://api.helius.xyz/v0'
  private cache = new Map<string, { data: any, timestamp: number }>()
  private cacheTimeout = 60000 // 1 minute

  async getTokenMetadata(mintAddress: string, apiKey: string): Promise<HeliusTokenData | null> {
    const cacheKey = `metadata-${mintAddress}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/token-metadata?api-key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAccounts: [mintAddress],
          includeOffChain: true,
          disableCache: false
        })
      })

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`)
      }

      const data = await response.json()
      const tokenData = data[0] || null
      
      this.cache.set(cacheKey, { data: tokenData, timestamp: Date.now() })
      return tokenData
    } catch (error) {
      console.error('Error fetching token metadata from Helius:', error)
      return null
    }
  }

  async getTransactionHistory(
    address: string, 
    apiKey: string,
    limit: number = 50
  ): Promise<HeliusTransactionData[]> {
    const cacheKey = `transactions-${address}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/addresses/${address}/transactions?api-key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching transaction history from Helius:', error)
      return []
    }
  }

  async getNFTsByOwner(
    ownerAddress: string, 
    apiKey: string,
    limit: number = 1000
  ): Promise<HeliusTokenData[]> {
    const cacheKey = `nfts-${ownerAddress}-${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/addresses/${ownerAddress}/nfts?api-key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching NFTs from Helius:', error)
      return []
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const heliusService = new HeliusService()