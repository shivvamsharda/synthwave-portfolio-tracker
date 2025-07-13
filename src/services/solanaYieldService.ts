import { Connection, PublicKey } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';

export interface SolanaYieldProtocol {
  id: string;
  name: string;
  protocol_type: string;
  program_id: string;
  website_url?: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
}

export interface SolanaPoolData {
  id: string;
  protocol_id: string;
  pool_address: string;
  pool_name: string;
  token_a_mint: string;
  token_b_mint?: string;
  token_a_symbol: string;
  token_b_symbol?: string;
  apy_7d?: number;
  apy_30d?: number;
  total_liquidity_usd?: number;
  volume_24h_usd?: number;
  rewards_token_mint?: string;
  rewards_token_symbol?: string;
  rewards_apy?: number;
  is_active: boolean;
  last_updated: string;
  protocol: SolanaYieldProtocol;
}

export interface SolanaYieldPosition {
  id: string;
  user_id: string;
  wallet_address: string;
  protocol_id: string;
  pool_id: string;
  position_address: string;
  staked_amount: number;
  staked_token_mint: string;
  staked_token_symbol: string;
  current_value_usd?: number;
  pending_rewards: number;
  rewards_token_mint?: string;
  rewards_token_symbol?: string;
  pending_rewards_usd?: number;
  entry_date: string;
  last_harvest_date?: string;
  status: 'active' | 'unstaking' | 'closed';
  protocol: SolanaYieldProtocol;
  pool: SolanaPoolData;
}

class SolanaYieldService {
  private connection: Connection;

  constructor() {
    // Use a high-performance RPC endpoint for better reliability
    this.connection = new Connection(
      'https://mainnet-beta.solana.com',
      'confirmed'
    );
  }

  // Fetch all available protocols
  async getProtocols(): Promise<SolanaYieldProtocol[]> {
    const { data, error } = await supabase
      .from('solana_yield_protocols')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching protocols:', error);
      return [];
    }

    return data || [];
  }

  // Fetch all available yield opportunities
  async getYieldOpportunities(): Promise<SolanaPoolData[]> {
    const { data, error } = await supabase
      .from('solana_pool_data')
      .select(`
        *,
        protocol:solana_yield_protocols(*)
      `)
      .eq('is_active', true)
      .order('apy_7d', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching yield opportunities:', error);
      return [];
    }

    return data || [];
  }

  // Fetch user's yield positions
  async getUserPositions(userId: string, walletAddress?: string): Promise<SolanaYieldPosition[]> {
    let query = supabase
      .from('solana_yield_positions')
      .select(`
        *,
        protocol:solana_yield_protocols(*),
        pool:solana_pool_data(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }

    const { data, error } = await query.order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }

    return (data || []) as unknown as SolanaYieldPosition[];
  }

  // Fetch live pool data from Raydium API
  async fetchRaydiumPools(): Promise<any[]> {
    try {
      const response = await fetch('https://api.raydium.io/v2/main/pairs');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching Raydium pools:', error);
      return [];
    }
  }

  // Fetch live pool data from Orca API
  async fetchOrcaPools(): Promise<any[]> {
    try {
      const response = await fetch('https://api.orca.so/v1/whirlpool/list');
      const data = await response.json();
      return data?.whirlpools || [];
    } catch (error) {
      console.error('Error fetching Orca pools:', error);
      return [];
    }
  }

  // Update pool data in database (called by background service)
  async updatePoolData(poolData: any): Promise<void> {
    const { error } = await supabase
      .from('solana_pool_data')
      .upsert(poolData, {
        onConflict: 'pool_address',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating pool data:', error);
    }
  }

  // Create a new yield position
  async createPosition(position: any): Promise<SolanaYieldPosition | null> {
    const { data, error } = await supabase
      .from('solana_yield_positions')
      .insert(position)
      .select(`
        *,
        protocol:solana_yield_protocols(*),
        pool:solana_pool_data(*)
      `)
      .single();

    if (error) {
      console.error('Error creating position:', error);
      return null;
    }

    return data as unknown as SolanaYieldPosition;
  }

  // Update position (stake amount, rewards, etc.)
  async updatePosition(positionId: string, updates: Partial<SolanaYieldPosition>): Promise<void> {
    const { error } = await supabase
      .from('solana_yield_positions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', positionId);

    if (error) {
      console.error('Error updating position:', error);
    }
  }

  // Record a yield farming transaction
  async recordTransaction(transaction: {
    user_id: string;
    wallet_address: string;
    position_id?: string;
    protocol_id: string;
    transaction_hash: string;
    transaction_type: 'stake' | 'unstake' | 'claim' | 'compound';
    amount?: number;
    token_mint?: string;
    token_symbol?: string;
    amount_usd?: number;
    rewards_claimed?: number;
    rewards_token_mint?: string;
    rewards_token_symbol?: string;
    rewards_claimed_usd?: number;
    block_time: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('solana_yield_transactions')
      .insert(transaction);

    if (error) {
      console.error('Error recording transaction:', error);
    }
  }

  // Check if wallet has positions in specific protocol
  async getWalletBalanceInProtocol(walletAddress: string, programId: string): Promise<number> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const programPubkey = new PublicKey(programId);
      
      // Get token accounts owned by the wallet for this program
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        walletPubkey,
        { programId: programPubkey }
      );

      // Calculate total balance across all token accounts
      let totalBalance = 0;
      for (const account of tokenAccounts.value) {
        const accountInfo = await this.connection.getTokenAccountBalance(account.pubkey);
        totalBalance += accountInfo.value.uiAmount || 0;
      }

      return totalBalance;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Sync user positions with on-chain data
  async syncUserPositions(userId: string, walletAddress: string): Promise<void> {
    try {
      const protocols = await this.getProtocols();
      const positions = await this.getUserPositions(userId, walletAddress);

      for (const position of positions) {
        // Get current on-chain balance
        const currentBalance = await this.getWalletBalanceInProtocol(
          walletAddress,
          position.protocol.program_id
        );

        // Update position if balance changed
        if (Math.abs(currentBalance - position.staked_amount) > 0.001) {
          await this.updatePosition(position.id, {
            staked_amount: currentBalance,
            current_value_usd: currentBalance * (position.pool.apy_7d || 0) / 100
          });
        }
      }
    } catch (error) {
      console.error('Error syncing user positions:', error);
    }
  }
}

export const solanaYieldService = new SolanaYieldService();