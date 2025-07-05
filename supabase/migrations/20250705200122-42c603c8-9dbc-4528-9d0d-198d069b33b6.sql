-- Create portfolio history table for tracking portfolio value over time
CREATE TABLE public.portfolio_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  total_value_change_24h NUMERIC DEFAULT 0,
  total_value_change_percentage_24h NUMERIC DEFAULT 0,
  total_assets INTEGER DEFAULT 0,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_history ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_history
CREATE POLICY "Users can view their own portfolio history" 
ON public.portfolio_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio history" 
ON public.portfolio_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio history" 
ON public.portfolio_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_portfolio_history_user_date ON public.portfolio_history(user_id, snapshot_date DESC);

-- Create function to calculate portfolio statistics
CREATE OR REPLACE FUNCTION public.calculate_portfolio_stats(user_uuid UUID)
RETURNS TABLE (
  total_value NUMERIC,
  total_value_24h_ago NUMERIC,
  total_value_7d_ago NUMERIC,
  value_change_24h NUMERIC,
  value_change_24h_percentage NUMERIC,
  value_change_7d NUMERIC,
  value_change_7d_percentage NUMERIC,
  total_assets INTEGER,
  total_unique_tokens INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH current_stats AS (
    SELECT 
      COALESCE(SUM(p.usd_value), 0) as current_total_value,
      COUNT(*) as current_total_assets,
      COUNT(DISTINCT p.token_mint) as current_unique_tokens
    FROM public.portfolio p
    WHERE p.user_id = user_uuid
  ),
  historical_24h AS (
    SELECT ph.total_value as value_24h_ago
    FROM public.portfolio_history ph
    WHERE ph.user_id = user_uuid 
      AND ph.snapshot_date >= (NOW() - INTERVAL '1 day')
    ORDER BY ph.snapshot_date ASC
    LIMIT 1
  ),
  historical_7d AS (
    SELECT ph.total_value as value_7d_ago
    FROM public.portfolio_history ph
    WHERE ph.user_id = user_uuid 
      AND ph.snapshot_date >= (NOW() - INTERVAL '7 days')
    ORDER BY ph.snapshot_date ASC
    LIMIT 1
  )
  SELECT 
    cs.current_total_value,
    COALESCE(h24.value_24h_ago, cs.current_total_value),
    COALESCE(h7d.value_7d_ago, cs.current_total_value),
    cs.current_total_value - COALESCE(h24.value_24h_ago, cs.current_total_value),
    CASE 
      WHEN COALESCE(h24.value_24h_ago, 0) = 0 THEN 0
      ELSE ((cs.current_total_value - COALESCE(h24.value_24h_ago, cs.current_total_value)) / COALESCE(h24.value_24h_ago, cs.current_total_value)) * 100
    END,
    cs.current_total_value - COALESCE(h7d.value_7d_ago, cs.current_total_value),
    CASE 
      WHEN COALESCE(h7d.value_7d_ago, 0) = 0 THEN 0
      ELSE ((cs.current_total_value - COALESCE(h7d.value_7d_ago, cs.current_total_value)) / COALESCE(h7d.value_7d_ago, cs.current_total_value)) * 100
    END,
    cs.current_total_assets::INTEGER,
    cs.current_unique_tokens::INTEGER
  FROM current_stats cs
  LEFT JOIN historical_24h h24 ON true
  LEFT JOIN historical_7d h7d ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;