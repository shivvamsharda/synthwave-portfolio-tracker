import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js'

// Solana mainnet RPC endpoint
const SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=4489f099-8307-4b7f-b48c-8ea926316e15'
const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

export interface TokenBalance {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  uiAmount: number
  logoURI?: string
}

export interface WalletHoldings {
  walletAddress: string
  solBalance: number
  tokens: TokenBalance[]
  totalUsdValue: number
}

// Known SPL tokens for mainnet (you can expand this list)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logoURI?: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  // Add more tokens as needed
}

export class SolanaService {
  private connection: Connection

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed')
  }

  /**
   * Get SOL balance for a wallet
   */
  async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress)
      const balance = await this.connection.getBalance(publicKey)
      return balance / 1e9 // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching SOL balance:', error)
      return 0
    }
  }

  /**
   * Get all SPL token balances for a wallet
   */
  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const publicKey = new PublicKey(walletAddress)
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // SPL Token program
        }
      )

      const tokens: TokenBalance[] = []

      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account.data as ParsedAccountData
        const tokenInfo = accountData.parsed.info

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const mint = tokenInfo.mint
          const knownToken = KNOWN_TOKENS[mint]
          
          tokens.push({
            mint,
            symbol: knownToken?.symbol || mint.slice(0, 4) + '...',
            name: knownToken?.name || 'Unknown Token',
            balance: tokenInfo.tokenAmount.amount,
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            logoURI: knownToken?.logoURI
          })
        }
      }

      return tokens
    } catch (error) {
      console.error('Error fetching token balances:', error)
      return []
    }
  }

  /**
   * Get complete wallet holdings (SOL + SPL tokens)
   */
  async getWalletHoldings(walletAddress: string): Promise<WalletHoldings> {
    try {
      const [solBalance, tokens] = await Promise.all([
        this.getSolBalance(walletAddress),
        this.getTokenBalances(walletAddress)
      ])

      // For now, we'll calculate USD value as 0 since we need price API integration
      // In next step, we'll add CoinGecko or similar price feeds
      const totalUsdValue = 0

      return {
        walletAddress,
        solBalance,
        tokens,
        totalUsdValue
      }
    } catch (error) {
      console.error('Error fetching wallet holdings:', error)
      return {
        walletAddress,
        solBalance: 0,
        tokens: [],
        totalUsdValue: 0
      }
    }
  }

  /**
   * Get holdings for multiple wallets
   */
  async getMultipleWalletHoldings(walletAddresses: string[]): Promise<WalletHoldings[]> {
    try {
      const holdingsPromises = walletAddresses.map(address => 
        this.getWalletHoldings(address)
      )
      
      return await Promise.all(holdingsPromises)
    } catch (error) {
      console.error('Error fetching multiple wallet holdings:', error)
      return []
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService()