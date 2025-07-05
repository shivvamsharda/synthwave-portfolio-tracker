import { Connection, PublicKey } from '@solana/web3.js'
import { supabase } from '@/integrations/supabase/client'
import { Buffer } from 'buffer'

// Ensure Buffer is available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}

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

  /**
   * Get token metadata from database cache first, then blockchain if not found
   */
  static async getTokenMetadata(mintAddress: string): Promise<BlockchainTokenMetadata | null> {
    try {
      // First, check database cache
      const cached = await this.getFromDatabase(mintAddress)
      if (cached) {
        console.log(`Found cached metadata for ${mintAddress}`)
        return cached
      }

      // If not in cache, fetch from blockchain
      console.log(`Fetching metadata from blockchain for ${mintAddress}`)
      const blockchainData = await this.fetchFromBlockchain(mintAddress)
      
      if (blockchainData) {
        // Save to database for future use
        await this.saveToDatabase(blockchainData)
        return blockchainData
      }

      return null
    } catch (error) {
      console.error('Error getting token metadata:', error)
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
      
      // Save successful results to database and add to result
      const savePromises: Promise<any>[] = []
      
      blockchainResults.forEach((metadata, index) => {
        if (metadata) {
          result[uncachedMints[index]] = metadata
          savePromises.push(this.saveToDatabase(metadata))
        }
      })

      // Save all new metadata to database
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
      const mintPubkey = new PublicKey(mintAddress)
      
      // Get token supply info for decimals
      const tokenSupply = await this.connection.getTokenSupply(mintPubkey)
      const decimals = tokenSupply.value.decimals

      // Try to get metadata from Metaplex Token Metadata Program
      const metadataAccount = await this.getMetaplexMetadata(mintAddress)
      
      if (metadataAccount) {
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
      return {
        mint: mintAddress,
        symbol: mintAddress.slice(0, 4) + '...',
        name: 'Unknown Token',
        decimals,
        is_verified: false
      }

    } catch (error) {
      console.error(`Error fetching blockchain metadata for ${mintAddress}:`, error)
      
      // Return basic fallback even on error to prevent complete failure
      try {
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
        console.error(`Complete fallback failed for ${mintAddress}:`, fallbackError)
        return null
      }
    }
  }

  /**
   * Get metadata from Metaplex Token Metadata Program
   */
  private static async getMetaplexMetadata(mintAddress: string): Promise<any> {
    try {
      // Derive metadata account address  
      const mintPubkey = new PublicKey(mintAddress)
      
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      // Get metadata account
      const metadataAccount = await this.connection.getAccountInfo(metadataAddress)
      
      if (metadataAccount) {
        // Parse metadata (simplified - in production you'd use @metaplex-foundation/mpl-token-metadata)
        const metadata = this.parseMetadataAccount(metadataAccount.data)
        
        // If metadata has URI, fetch JSON metadata
        if (metadata.uri) {
          const response = await fetch(metadata.uri)
          if (response.ok) {
            const jsonMetadata = await response.json()
            return {
              ...metadata,
              ...jsonMetadata
            }
          }
        }
        
        return metadata
      }

      return null
    } catch (error) {
      console.error('Error fetching Metaplex metadata:', error)
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
   * Safely decode string from bytes with error handling
   */
  private static safeDecodeString(bytes: Buffer): string {
    try {
      // Try UTF-8 first
      return bytes.toString('utf8').replace(/\0/g, '').trim()
    } catch (error) {
      try {
        // Fallback to latin1
        return bytes.toString('latin1').replace(/\0/g, '').trim()
      } catch (fallbackError) {
        console.warn('String decode failed:', fallbackError)
        return ''
      }
    }
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
}

export const blockchainMetadataService = BlockchainMetadataService