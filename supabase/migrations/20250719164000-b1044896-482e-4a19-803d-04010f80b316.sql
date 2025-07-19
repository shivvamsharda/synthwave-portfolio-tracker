-- Clean all wallet management data for all users
DELETE FROM public.portfolio_history;
DELETE FROM public.portfolio;
DELETE FROM public.solana_yield_transactions;
DELETE FROM public.solana_yield_positions;
DELETE FROM public.wallets;