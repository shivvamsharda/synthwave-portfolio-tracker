-- Create Solana yield farming database schema

-- Table for Solana DeFi protocols
CREATE TABLE public.solana_yield_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  protocol_type TEXT NOT NULL, -- 'amm', 'lending', 'liquid_staking', 'vault'
  program_id TEXT NOT NULL UNIQUE,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for yield pool/farm data
CREATE TABLE public.solana_pool_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.solana_yield_protocols(id),
  pool_address TEXT NOT NULL,
  pool_name TEXT NOT NULL,
  token_a_mint TEXT NOT NULL,
  token_b_mint TEXT,
  token_a_symbol TEXT NOT NULL,
  token_b_symbol TEXT,
  apy_7d NUMERIC(10,4),
  apy_30d NUMERIC(10,4),
  total_liquidity_usd NUMERIC(20,2),
  volume_24h_usd NUMERIC(20,2),
  rewards_token_mint TEXT,
  rewards_token_symbol TEXT,
  rewards_apy NUMERIC(10,4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user yield positions
CREATE TABLE public.solana_yield_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  protocol_id UUID NOT NULL REFERENCES public.solana_yield_protocols(id),
  pool_id UUID NOT NULL REFERENCES public.solana_pool_data(id),
  position_address TEXT NOT NULL,
  staked_amount NUMERIC(20,8) NOT NULL DEFAULT 0,
  staked_token_mint TEXT NOT NULL,
  staked_token_symbol TEXT NOT NULL,
  current_value_usd NUMERIC(20,2),
  pending_rewards NUMERIC(20,8) DEFAULT 0,
  rewards_token_mint TEXT,
  rewards_token_symbol TEXT,
  pending_rewards_usd NUMERIC(20,2) DEFAULT 0,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_harvest_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'unstaking', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for yield farming transactions
CREATE TABLE public.solana_yield_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  position_id UUID REFERENCES public.solana_yield_positions(id),
  protocol_id UUID NOT NULL REFERENCES public.solana_yield_protocols(id),
  transaction_hash TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'stake', 'unstake', 'claim', 'compound'
  amount NUMERIC(20,8),
  token_mint TEXT,
  token_symbol TEXT,
  amount_usd NUMERIC(20,2),
  rewards_claimed NUMERIC(20,8),
  rewards_token_mint TEXT,
  rewards_token_symbol TEXT,
  rewards_claimed_usd NUMERIC(20,2),
  block_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.solana_yield_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_pool_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_yield_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_yield_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for protocols and pool data (publicly readable for discovery)
CREATE POLICY "Protocols are publicly readable" ON public.solana_yield_protocols
  FOR SELECT USING (true);

CREATE POLICY "Pool data is publicly readable" ON public.solana_pool_data
  FOR SELECT USING (true);

CREATE POLICY "System can manage protocols" ON public.solana_yield_protocols
  FOR ALL USING (true);

CREATE POLICY "System can manage pool data" ON public.solana_pool_data
  FOR ALL USING (true);

-- RLS Policies for user positions (user-specific)
CREATE POLICY "Users can view their own positions" ON public.solana_yield_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions" ON public.solana_yield_positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions" ON public.solana_yield_positions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage all positions" ON public.solana_yield_positions
  FOR ALL USING (true);

-- RLS Policies for transactions (user-specific)
CREATE POLICY "Users can view their own transactions" ON public.solana_yield_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.solana_yield_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage all transactions" ON public.solana_yield_transactions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_solana_pool_data_protocol_id ON public.solana_pool_data(protocol_id);
CREATE INDEX idx_solana_pool_data_pool_address ON public.solana_pool_data(pool_address);
CREATE INDEX idx_solana_yield_positions_user_id ON public.solana_yield_positions(user_id);
CREATE INDEX idx_solana_yield_positions_wallet_address ON public.solana_yield_positions(wallet_address);
CREATE INDEX idx_solana_yield_positions_protocol_id ON public.solana_yield_positions(protocol_id);
CREATE INDEX idx_solana_yield_transactions_user_id ON public.solana_yield_transactions(user_id);
CREATE INDEX idx_solana_yield_transactions_wallet_address ON public.solana_yield_transactions(wallet_address);
CREATE INDEX idx_solana_yield_transactions_transaction_hash ON public.solana_yield_transactions(transaction_hash);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_solana_yield_protocols_updated_at
  BEFORE UPDATE ON public.solana_yield_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solana_yield_positions_updated_at
  BEFORE UPDATE ON public.solana_yield_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial Solana DeFi protocols
INSERT INTO public.solana_yield_protocols (name, protocol_type, program_id, website_url, logo_url, description) VALUES
('Raydium', 'amm', '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', 'https://raydium.io', 'https://raydium.io/logo.png', 'Leading AMM and liquidity provider on Solana'),
('Orca', 'amm', 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', 'https://orca.so', 'https://orca.so/logo.png', 'User-friendly AMM with concentrated liquidity'),
('Meteora', 'vault', 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', 'https://meteora.ag', 'https://meteora.ag/logo.png', 'Dynamic vaults and liquidity solutions'),
('Kamino', 'lending', 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD', 'https://kamino.finance', 'https://kamino.finance/logo.png', 'Automated leverage and lending strategies'),
('Marinade', 'liquid_staking', '8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC', 'https://marinade.finance', 'https://marinade.finance/logo.png', 'Liquid staking solution for Solana'),
('Jito', 'liquid_staking', 'Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb', 'https://jito.network', 'https://jito.network/logo.png', 'MEV-enhanced liquid staking');