-- Create token transactions table for tracking all token transfers/swaps
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  token_mint_from TEXT,
  token_mint_to TEXT,
  amount_from NUMERIC,
  amount_to NUMERIC,
  transaction_type TEXT NOT NULL, -- 'swap', 'transfer', 'buy', 'sell'
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  block_height BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet snapshots table for historical holdings
CREATE TABLE public.wallet_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  token_mint TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  usd_value NUMERIC,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create token holders table for current holder rankings
CREATE TABLE public.token_holders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_mint TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  usd_value NUMERIC,
  percentage_of_supply NUMERIC,
  holder_rank INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(token_mint, wallet_address)
);

-- Create token flow analysis table for aggregated flow data
CREATE TABLE public.token_flow_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_mint TEXT NOT NULL,
  flow_direction TEXT NOT NULL, -- 'in', 'out'
  source_token TEXT,
  destination_token TEXT,
  total_volume NUMERIC NOT NULL,
  unique_wallets INTEGER NOT NULL,
  time_period TEXT NOT NULL, -- '1h', '24h', '7d', '30d'
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_token_transactions_wallet ON token_transactions(wallet_address);
CREATE INDEX idx_token_transactions_token_from ON token_transactions(token_mint_from);
CREATE INDEX idx_token_transactions_token_to ON token_transactions(token_mint_to);
CREATE INDEX idx_token_transactions_timestamp ON token_transactions(timestamp);

CREATE INDEX idx_wallet_snapshots_wallet ON wallet_snapshots(wallet_address);
CREATE INDEX idx_wallet_snapshots_token ON wallet_snapshots(token_mint);
CREATE INDEX idx_wallet_snapshots_date ON wallet_snapshots(snapshot_date);

CREATE INDEX idx_token_holders_token ON token_holders(token_mint);
CREATE INDEX idx_token_holders_wallet ON token_holders(wallet_address);
CREATE INDEX idx_token_holders_rank ON token_holders(holder_rank);

CREATE INDEX idx_token_flow_token ON token_flow_analysis(token_mint);
CREATE INDEX idx_token_flow_date ON token_flow_analysis(analysis_date);

-- Enable RLS on all tables
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_flow_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - These tables are for analytics, so we'll make them readable by authenticated users
-- but restrict write access to specific operations

-- Token transactions policies
CREATE POLICY "Token transactions are readable by authenticated users" 
ON public.token_transactions 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert token transactions" 
ON public.token_transactions 
FOR INSERT 
WITH CHECK (true);

-- Wallet snapshots policies  
CREATE POLICY "Wallet snapshots are readable by authenticated users" 
ON public.wallet_snapshots 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert wallet snapshots" 
ON public.wallet_snapshots 
FOR INSERT 
WITH CHECK (true);

-- Token holders policies
CREATE POLICY "Token holders are readable by authenticated users" 
ON public.token_holders 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage token holders" 
ON public.token_holders 
FOR ALL 
USING (true);

-- Token flow analysis policies
CREATE POLICY "Token flow analysis is readable by authenticated users" 
ON public.token_flow_analysis 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage token flow analysis" 
ON public.token_flow_analysis 
FOR ALL 
USING (true);