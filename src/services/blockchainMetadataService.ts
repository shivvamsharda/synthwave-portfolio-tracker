import { Connection, PublicKey } from '@solana/web3.js'
import { supabase } from '@/integrations/supabase/client'
import { Buffer } from 'buffer'

// Ensure Buffer is available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}

// Jupiter API for token metadata fallback
const JUPITER_TOKEN_LIST_URL = 'https://token.jup.ag/all'

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

interface BlockchainTokenMetadata {
  mint: string
  symbol: string
  name: string
  logo_uri?: string
  description?: string
  website?: string
  twitter?: string
  decimals: number
  is_verified: boolean
}

export class BlockchainMetadataService {
  private static connection = new Connection('https://mainnet.helius-rpc.com/?api-key=4489f099-8307-4b7f-b48c-8ea926316e15', 'confirmed')
  private static jupiterTokenCache: Record<string, any> | null = null
  private static jupiterCacheExpiry: number = 0
  private static readonly JUPITER_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get token metadata from database cache first, then blockchain if not found
   */
  static async getTokenMetadata(mintAddress: string): Promise<BlockchainTokenMetadata | null> {
    try {
      console.log(`🔍 Getting metadata for token: ${mintAddress}`)
      
      // First, check database cache
      const cached = await this.getFromDatabase(mintAddress)
      if (cached) {
        console.log(`✅ Found cached metadata for ${mintAddress}:`, cached)
        return cached
      }

      // If not in cache, fetch from blockchain
      console.log(`🚀 Fetching metadata from blockchain for ${mintAddress}`)
      const blockchainData = await this.fetchFromBlockchain(mintAddress)
      
      if (blockchainData) {
        console.log(`✅ Successfully fetched blockchain metadata:`, blockchainData)
        // Save to database for future use
        await this.saveToDatabase(blockchainData)
        return blockchainData
      }

      // Fallback to Jupiter API if blockchain fetch failed
      console.log(`🪐 Trying Jupiter API fallback for ${mintAddress}`)
      const jupiterData = await this.fetchFromJupiter(mintAddress)
      
      if (jupiterData) {
        console.log(`✅ Successfully fetched Jupiter metadata:`, jupiterData)
        // Save to database for future use
        await this.saveToDatabase(jupiterData)
        return jupiterData
      }

      // Final fallback: return basic metadata with mint abbreviation
      console.log(`⚠️ Creating fallback metadata for ${mintAddress}`)
      const fallbackData: BlockchainTokenMetadata = {
        mint: mintAddress,
        symbol: mintAddress.slice(0, 4) + '...' + mintAddress.slice(-4),
        name: `Token ${mintAddress.slice(0, 8)}...`,
        decimals: 6, // Default decimals for unknown tokens
        is_verified: false
      }
      
      // Don't save fallback data to database to allow future retries
      return fallbackData
    } catch (error) {
      console.error(`❌ Error getting token metadata for ${mintAddress}:`, error)
      return null
    }
  }

  /**
   * Get multiple token metadata efficiently
   */
  static async getMultipleTokenMetadata(mintAddresses: string[]): Promise<Record<string, BlockchainTokenMetadata>> {
    const result: Record<string, BlockchainTokenMetadata> = {}
    const uncachedMints: string[] = []

    // First, get all cached metadata from database
    const { data: cachedData } = await supabase
      .from('token_metadata')
      .select('*')
      .in('token_mint', mintAddresses)

    // Map cached data
    cachedData?.forEach(token => {
      result[token.token_mint] = {
        mint: token.token_mint,
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || 'Unknown Token',
        logo_uri: token.logo_uri,
        description: token.description,
        website: token.website,
        twitter: token.twitter,
        decimals: token.decimals || 0,
        is_verified: token.is_verified || false
      }
    })

    // Find mints that weren't cached
    mintAddresses.forEach(mint => {
      if (!result[mint]) {
        uncachedMints.push(mint)
      }
    })

    // Fetch uncached mints from blockchain
    if (uncachedMints.length > 0) {
      console.log(`Fetching ${uncachedMints.length} uncached tokens from blockchain`)
      
      const blockchainPromises = uncachedMints.map(mint => 
        this.fetchFromBlockchain(mint).catch(error => {
          console.error(`Failed to fetch ${mint}:`, error)
          return null
        })
      )

      const blockchainResults = await Promise.all(blockchainPromises)
      
      // For tokens that failed blockchain fetch, try Jupiter API
      const failedMints: string[] = []
      blockchainResults.forEach((metadata, index) => {
        if (metadata) {
          result[uncachedMints[index]] = metadata
        } else {
          failedMints.push(uncachedMints[index])
        }
      })

      // Try Jupiter API for failed blockchain fetches
      if (failedMints.length > 0) {
        console.log(`Trying Jupiter API for ${failedMints.length} failed blockchain fetches`)
        const jupiterPromises = failedMints.map(mint => 
          this.fetchFromJupiter(mint).catch(error => {
            console.error(`Failed Jupiter fetch for ${mint}:`, error)
            return null
          })
        )

        const jupiterResults = await Promise.all(jupiterPromises)
        jupiterResults.forEach((metadata, index) => {
          if (metadata) {
            result[failedMints[index]] = metadata
          } else {
            // Final fallback for completely failed tokens
            const mint = failedMints[index]
            result[mint] = {
              mint,
              symbol: mint.slice(0, 4) + '...' + mint.slice(-4),
              name: `Token ${mint.slice(0, 8)}...`,
              decimals: 6,
              is_verified: false
            }
          }
        })
      }

      // Save successful metadata to database
      const savePromises: Promise<any>[] = []
      Object.values(result).forEach(metadata => {
        // Only save if it's not fallback data and not already cached
        if (metadata.symbol !== `${metadata.mint.slice(0, 4)}...${metadata.mint.slice(-4)}` && 
            uncachedMints.includes(metadata.mint)) {
          savePromises.push(this.saveToDatabase(metadata))
        }
      })

      if (savePromises.length > 0) {
        await Promise.all(savePromises.map(p => p.catch(e => console.error('Save error:', e))))
      }
    }

    return result
  }

  /**
   * Fetch token metadata directly from Solana blockchain
   */
  private static async fetchFromBlockchain(mintAddress: string): Promise<BlockchainTokenMetadata | null> {
    try {
      console.log(`🔗 Connecting to blockchain for ${mintAddress}`)
      
      // Check if Buffer is available
      if (typeof Buffer === 'undefined') {
        console.error('❌ Buffer is not defined - polyfill may not be working')
        return null
      }
      
      const mintPubkey = new PublicKey(mintAddress)
      console.log(`📊 Getting token supply for ${mintAddress}`)
      
      // Get token supply info for decimals
      const tokenSupply = await this.connection.getTokenSupply(mintPubkey)
      const decimals = tokenSupply.value.decimals
      console.log(`✅ Token decimals: ${decimals}`)

      // Try to get metadata from Metaplex Token Metadata Program
      console.log(`🎯 Attempting to fetch Metaplex metadata for ${mintAddress}`)
      const metadataAccount = await this.getMetaplexMetadata(mintAddress)
      
      if (metadataAccount) {
        console.log(`✅ Got Metaplex metadata:`, metadataAccount)
        return {
          mint: mintAddress,
          symbol: metadataAccount.symbol || mintAddress.slice(0, 4) + '...',
          name: metadataAccount.name || 'Unknown Token',
          logo_uri: metadataAccount.image,
          description: metadataAccount.description,
          website: metadataAccount.external_url,
          twitter: metadataAccount.twitter,
          decimals,
          is_verified: false
        }
      }

      // Fallback: basic metadata with decimals
      console.log(`⚠️ No Metaplex metadata found, returning basic info for ${mintAddress}`)
      return {
        mint: mintAddress,
        symbol: mintAddress.slice(0, 4) + '...',
        name: 'Unknown Token',
        decimals,
        is_verified: false
      }

    } catch (error) {
      console.error(`❌ Error fetching blockchain metadata for ${mintAddress}:`, error)
      
      // Return basic fallback even on error to prevent complete failure
      try {
        console.log(`🔄 Attempting fallback for ${mintAddress}`)
        const mintPubkey = new PublicKey(mintAddress)
        const tokenSupply = await this.connection.getTokenSupply(mintPubkey)
        return {
          mint: mintAddress,
          symbol: mintAddress.slice(0, 4) + '...',
          name: 'Unknown Token',
          decimals: tokenSupply.value.decimals,
          is_verified: false
        }
      } catch (fallbackError) {
        console.error(`❌ Complete fallback failed for ${mintAddress}:`, fallbackError)
        return null
      }
    }
  }

  /**
   * Get metadata from Metaplex Token Metadata Program
   */
  private static async getMetaplexMetadata(mintAddress: string): Promise<any> {
    try {
      console.log(`🎭 Getting Metaplex metadata for ${mintAddress}`)
      
      // Derive metadata account address  
      const mintPubkey = new PublicKey(mintAddress)
      
      console.log(`🔑 Deriving metadata account address...`)
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
      console.log(`📍 Metadata account address: ${metadataAddress.toString()}`)

      // Get metadata account
      console.log(`📡 Fetching metadata account info...`)
      const metadataAccount = await this.connection.getAccountInfo(metadataAddress)
      
      if (metadataAccount) {
        console.log(`✅ Found metadata account, parsing data...`)
        // Parse metadata (simplified - in production you'd use @metaplex-foundation/mpl-token-metadata)
        const metadata = this.parseMetadataAccount(metadataAccount.data)
        console.log(`🔍 Parsed metadata:`, metadata)
        
        // If metadata has URI, fetch JSON metadata
        if (metadata.uri) {
          console.log(`🌐 Fetching JSON metadata from URI: ${metadata.uri}`)
          try {
            const response = await fetch(metadata.uri)
            if (response.ok) {
              const jsonMetadata = await response.json()
              console.log(`✅ Got JSON metadata:`, jsonMetadata)
              return {
                ...metadata,
                ...jsonMetadata
              }
            } else {
              console.log(`⚠️ Failed to fetch JSON metadata, status: ${response.status}`)
            }
          } catch (fetchError) {
            console.error(`❌ Error fetching JSON metadata:`, fetchError)
          }
        }
        
        return metadata
      } else {
        console.log(`❌ No metadata account found for ${mintAddress}`)
      }

      return null
    } catch (error) {
      console.error(`❌ Error fetching Metaplex metadata for ${mintAddress}:`, error)
      return null
    }
  }

  /**
   * Simple metadata account parser (simplified version)
   */
  private static parseMetadataAccount(data: Buffer): any {
    try {
      // This is a simplified parser - in production use @metaplex-foundation/mpl-token-metadata
      let offset = 1 // Skip discriminator
      
      // Ensure we have enough data
      if (data.length < 43) {
        console.warn('Metadata account data too short')
        return {}
      }
      
      // Read name (32 bytes, null-terminated)
      const nameBytes = data.slice(offset, offset + 32)
      const name = this.safeDecodeString(nameBytes)
      offset += 32
      
      // Read symbol (10 bytes, null-terminated)
      const symbolBytes = data.slice(offset, offset + 10)
      const symbol = this.safeDecodeString(symbolBytes)
      offset += 10
      
      // Read URI (200 bytes, null-terminated) - check bounds
      if (data.length >= offset + 200) {
        const uriBytes = data.slice(offset, offset + 200)
        const uri = this.safeDecodeString(uriBytes)
        
        return {
          name: name || null,
          symbol: symbol || null,
          uri: uri || null
        }
      }
      
      return {
        name: name || null,
        symbol: symbol || null,
        uri: null
      }
    } catch (error) {
      console.error('Error parsing metadata account:', error)
      return {}
    }
  }

  /**
   * Safely decode string from bytes with error handling and sanitization
   */
  private static safeDecodeString(bytes: Buffer): string {
    try {
      // Try UTF-8 first
      let decoded = bytes.toString('utf8').replace(/\0/g, '').trim()
      
      // Sanitize the string to remove non-printable characters
      decoded = this.sanitizeString(decoded)
      
      // If the string is mostly garbage, try latin1 fallback
      if (!this.isValidString(decoded)) {
        decoded = bytes.toString('latin1').replace(/\0/g, '').trim()
        decoded = this.sanitizeString(decoded)
      }
      
      // Final validation - return empty if still invalid
      return this.isValidString(decoded) ? decoded : ''
    } catch (error) {
      console.warn('String decode failed:', error)
      return ''
    }
  }
  
  /**
   * Sanitize string by removing non-printable characters and limiting length
   */
  private static sanitizeString(str: string): string {
    if (!str) return ''
    
    // Remove control characters but keep basic whitespace
    const sanitized = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    
    // Limit length (symbols: 10 chars, names: 50 chars)
    const maxLength = sanitized.length <= 10 ? 10 : 50
    return sanitized.substring(0, maxLength).trim()
  }
  
  /**
   * Check if a string is valid (contains mostly printable ASCII characters)
   */
  private static isValidString(str: string): boolean {
    if (!str || str.length === 0) return false
    if (str.length > 50) return false // Too long, probably garbage
    
    // Count printable ASCII characters (32-126)
    const printableChars = str.split('').filter(char => {
      const code = char.charCodeAt(0)
      return code >= 32 && code <= 126
    }).length
    
    // At least 70% should be printable ASCII for symbols/names
    const ratio = printableChars / str.length
    return ratio >= 0.7 && str.length >= 1
  }

  /**
   * Get token metadata from database
   */
  private static async getFromDatabase(mintAddress: string): Promise<BlockchainTokenMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('token_mint', mintAddress)
        .single()

      if (error || !data) {
        return null
      }

      return {
        mint: data.token_mint,
        symbol: data.symbol || 'UNKNOWN',
        name: data.name || 'Unknown Token',
        logo_uri: data.logo_uri,
        description: data.description,
        website: data.website,
        twitter: data.twitter,
        decimals: data.decimals || 0,
        is_verified: data.is_verified || false
      }
    } catch (error) {
      console.error('Error getting metadata from database:', error)
      return null
    }
  }

  /**
   * Save token metadata to database
   */
  private static async saveToDatabase(metadata: BlockchainTokenMetadata): Promise<void> {
    try {
      const { error } = await supabase
        .from('token_metadata')
        .upsert({
          token_mint: metadata.mint,
          symbol: metadata.symbol,
          name: metadata.name,
          logo_uri: metadata.logo_uri,
          description: metadata.description,
          website: metadata.website,
          twitter: metadata.twitter,
          decimals: metadata.decimals,
          is_verified: metadata.is_verified
        }, {
          onConflict: 'token_mint'
        })

      if (error) {
        console.error('Error saving metadata to database:', error)
      } else {
        console.log(`Saved metadata for ${metadata.mint} to database`)
      }
    } catch (error) {
      console.error('Error saving to database:', error)
    }
  }

  /**
   * Fetch token metadata from Jupiter API
   */
  private static async fetchFromJupiter(mintAddress: string): Promise<BlockchainTokenMetadata | null> {
    try {
      console.log(`🪐 Fetching Jupiter metadata for ${mintAddress}`)
      
      // Get Jupiter token list (cached)
      const jupiterTokens = await this.getJupiterTokenList()
      const tokenData = jupiterTokens[mintAddress]
      
      if (tokenData) {
        console.log(`✅ Found Jupiter metadata for ${mintAddress}:`, tokenData)
        return {
          mint: mintAddress,
          symbol: tokenData.symbol || mintAddress.slice(0, 4) + '...',
          name: tokenData.name || 'Unknown Token',
          logo_uri: tokenData.logoURI,
          description: tokenData.description,
          website: tokenData.website,
          twitter: tokenData.twitter,
          decimals: tokenData.decimals || 6,
          is_verified: tokenData.verified || false
        }
      }

      console.log(`❌ Token not found in Jupiter list: ${mintAddress}`)
      return null
    } catch (error) {
      console.error(`❌ Error fetching Jupiter metadata for ${mintAddress}:`, error)
      return null
    }
  }

  /**
   * Get cached Jupiter token list or fetch new one
   */
  private static async getJupiterTokenList(): Promise<Record<string, any>> {
    try {
      const now = Date.now()
      
      // Check if cache is valid
      if (this.jupiterTokenCache && now < this.jupiterCacheExpiry) {
        console.log('📦 Using cached Jupiter token list')
        return this.jupiterTokenCache
      }

      console.log('🌐 Fetching fresh Jupiter token list')
      const response = await fetch(JUPITER_TOKEN_LIST_URL)
      
      if (!response.ok) {
        throw new Error(`Jupiter API responded with status: ${response.status}`)
      }

      const tokens = await response.json()
      
      // Convert array to mint-keyed object for faster lookups
      const tokenMap: Record<string, any> = {}
      tokens.forEach((token: any) => {
        tokenMap[token.address] = token
      })

      // Cache the result
      this.jupiterTokenCache = tokenMap
      this.jupiterCacheExpiry = now + this.JUPITER_CACHE_DURATION

      console.log(`✅ Cached ${Object.keys(tokenMap).length} Jupiter tokens`)
      return tokenMap
    } catch (error) {
      console.error('❌ Error fetching Jupiter token list:', error)
      
      // Return cached data if available, even if expired
      if (this.jupiterTokenCache) {
        console.log('⚠️ Using expired Jupiter cache due to fetch error')
        return this.jupiterTokenCache
      }
      
      return {}
    }
  }
}

export const blockchainMetadataService = BlockchainMetadataService