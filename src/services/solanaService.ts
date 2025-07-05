import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js'
import { tokenMetadataService } from './tokenMetadataService'
import { blockchainMetadataService } from './blockchainMetadataService'

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

// Known SPL tokens for mainnet with logos and metadata - Extended list
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logoURI?: string; description?: string; website?: string; twitter?: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    description: 'Solana is a high-performance blockchain platform for decentralized applications and crypto-currencies.',
    website: 'https://solana.com',
    twitter: 'https://twitter.com/solana'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    description: 'USDC is a fully collateralized US dollar stablecoin.',
    website: 'https://www.centre.io/',
    twitter: 'https://twitter.com/centre_io'
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    description: 'Tether USD is a stablecoin pegged to the US dollar.',
    website: 'https://tether.to/',
    twitter: 'https://twitter.com/Tether_to'
  },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    symbol: 'mSOL',
    name: 'Marinade staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    description: 'Liquid staking token representing staked SOL in Marinade Finance.',
    website: 'https://marinade.finance/',
    twitter: 'https://twitter.com/MarinadeFinance'
  },
  '7dHbWXmci3dT6jZmpyS8J2h7V4k8EG1XaBtFr9TvQw4o': {
    symbol: 'JITO',
    name: 'Jito Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT6jZmpyS8J2h7V4k8EG1XaBtFr9TvQw4o/logo.png',
    description: 'Jito staked SOL token for MEV-optimized staking.',
    website: 'https://www.jito.wtf/',
    twitter: 'https://twitter.com/jito_sol'
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    name: 'Bonk',
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY58',
    description: 'The first Solana dog coin for the people, by the people.',
    website: 'https://bonkcoin.com/',
    twitter: 'https://twitter.com/bonk_inu'
  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': {
    symbol: 'JUP',
    name: 'Jupiter',
    logoURI: 'https://static.jup.ag/jup/icon.png',
    description: 'Jupiter is the key liquidity aggregator for Solana.',
    website: 'https://jup.ag/',
    twitter: 'https://twitter.com/JupiterExchange'
  },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': {
    symbol: 'jitoSOL',
    name: 'Jito Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png',
    description: 'Liquid staking token from Jito.',
    website: 'https://www.jito.wtf/',
    twitter: 'https://twitter.com/jito_sol'
  },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': {
    symbol: 'bSOL',
    name: 'BlazeStake Staked SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png',
    description: 'Liquid staking token from BlazeStake.',
    website: 'https://stake.solblaze.org/',
    twitter: 'https://twitter.com/SolBlazeOrg'
  },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': {
    symbol: 'PYTH',
    name: 'Pyth Network',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png',
    description: 'Pyth delivers real-time market data to smart contracts.',
    website: 'https://pyth.network/',
    twitter: 'https://twitter.com/PythNetwork'
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
      const unknownMints: string[] = []

      // First pass: identify tokens and collect unknown mints
      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account.data as ParsedAccountData
        const tokenInfo = accountData.parsed.info

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const mint = tokenInfo.mint
          const knownToken = KNOWN_TOKENS[mint]
          
          if (!knownToken) {
            unknownMints.push(mint)
          }
        }
      }

      // Fetch metadata for unknown tokens (checks database first, then blockchain)
      let blockchainMetadata: Record<string, any> = {}
      if (unknownMints.length > 0) {
        console.log(`Fetching metadata for ${unknownMints.length} unknown tokens`)
        blockchainMetadata = await blockchainMetadataService.getMultipleTokenMetadata(unknownMints)
      }

      // Second pass: build token list with all metadata
      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account.data as ParsedAccountData
        const tokenInfo = accountData.parsed.info

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const mint = tokenInfo.mint
          const knownToken = KNOWN_TOKENS[mint]
          const blockchainData = blockchainMetadata[mint]
          
          tokens.push({
            mint,
            symbol: knownToken?.symbol || blockchainData?.symbol || mint.slice(0, 4) + '...',
            name: knownToken?.name || blockchainData?.name || 'Unknown Token',
            balance: tokenInfo.tokenAmount.amount,
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            logoURI: knownToken?.logoURI || blockchainData?.logo_uri,
            description: knownToken?.description || blockchainData?.description,
            website: knownToken?.website || blockchainData?.website,
            twitter: knownToken?.twitter || blockchainData?.twitter
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