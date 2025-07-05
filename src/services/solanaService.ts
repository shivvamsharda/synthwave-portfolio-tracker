import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js'
import { tokenMetadataService } from './tokenMetadataService'

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
  description?: string
  website?: string
  twitter?: string
}

export interface WalletHoldings {
  walletAddress: string
  solBalance: number
  tokens: TokenBalance[]
  totalUsdValue: number
}

// Known SPL tokens for mainnet with logos and metadata
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logoURI?: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
  },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    symbol: 'mSOL',
    name: 'Marinade staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png'
  },
  '7dHbWXmci3dT6jZmpyS8J2h7V4k8EG1XaBtFr9TvQw4o': {
    symbol: 'JITO',
    name: 'Jito Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT6jZmpyS8J2h7V4k8EG1XaBtFr9TvQw4o/logo.png'
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY58'
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
    symbol: 'JUP',
    name: 'Jupiter',
    logoURI: 'https://static.jup.ag/jup/icon.png'
  },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': {
    symbol: 'jitoSOL',
    name: 'Jito Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png'
  },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': {
    symbol: 'bSOL',
    name: 'BlazeStake Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png'
  },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': {
    symbol: 'PYTH',
    name: 'Pyth Network',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png'
  }
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
   * Get all SPL token balances for a wallet with enhanced metadata
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
      const tokenMints: string[] = []

      // Collect all token mints first
      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account.data as ParsedAccountData
        const tokenInfo = accountData.parsed.info

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          tokenMints.push(tokenInfo.mint)
        }
      }

      // Fetch metadata for all tokens at once
      const metadataMap = await tokenMetadataService.getTokensMetadata(tokenMints)

      // Build token list with enhanced metadata
      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account.data as ParsedAccountData
        const tokenInfo = accountData.parsed.info

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const mint = tokenInfo.mint
          const knownToken = KNOWN_TOKENS[mint]
          const metadata = metadataMap[mint]
          
          tokens.push({
            mint,
            symbol: metadata?.symbol || knownToken?.symbol || mint.slice(0, 4) + '...',
            name: metadata?.name || knownToken?.name || 'Unknown Token',
            balance: tokenInfo.tokenAmount.amount,
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            logoURI: metadata?.logoURI || knownToken?.logoURI,
            description: metadata?.description || metadata?.extensions?.description,
            website: metadata?.website || metadata?.extensions?.website,
            twitter: metadata?.twitter || metadata?.extensions?.twitter
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