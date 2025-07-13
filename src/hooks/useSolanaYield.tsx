import { useState, useEffect } from 'react';
import { solanaYieldService, SolanaYieldProtocol, SolanaPoolData, SolanaYieldPosition } from '@/services/solanaYieldService';
import { useAuth } from './useAuth';
import { useWallet } from './useWallet';

export const useSolanaYield = () => {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  
  const [protocols, setProtocols] = useState<SolanaYieldProtocol[]>([]);
  const [yieldOpportunities, setYieldOpportunities] = useState<SolanaPoolData[]>([]);
  const [userPositions, setUserPositions] = useState<SolanaYieldPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadYieldData();
  }, []);

  // Load user positions when user/wallet changes
  useEffect(() => {
    if (user && connected && publicKey) {
      loadUserPositions();
    }
  }, [user, connected, publicKey]);

  const loadYieldData = async () => {
    setLoading(true);
    try {
      const [protocolsData, opportunitiesData] = await Promise.all([
        solanaYieldService.getProtocols(),
        solanaYieldService.getYieldOpportunities()
      ]);
      
      setProtocols(protocolsData);
      setYieldOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Error loading yield data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPositions = async () => {
    if (!user || !publicKey) return;
    
    try {
      const positions = await solanaYieldService.getUserPositions(
        user.id,
        publicKey.toString()
      );
      setUserPositions(positions);
    } catch (error) {
      console.error('Error loading user positions:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadYieldData(),
        user && publicKey ? loadUserPositions() : Promise.resolve()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const syncPositions = async () => {
    if (!user || !publicKey) return;
    
    try {
      await solanaYieldService.syncUserPositions(user.id, publicKey.toString());
      await loadUserPositions();
    } catch (error) {
      console.error('Error syncing positions:', error);
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalStaked: userPositions.reduce((sum, pos) => sum + (pos.current_value_usd || 0), 0),
    pendingRewards: userPositions.reduce((sum, pos) => sum + (pos.pending_rewards_usd || 0), 0),
    averageAPR: userPositions.length > 0 
      ? userPositions.reduce((sum, pos) => sum + (pos.pool.apy_7d || 0), 0) / userPositions.length 
      : 0,
    activePositions: userPositions.filter(pos => pos.status === 'active').length
  };

  return {
    protocols,
    yieldOpportunities,
    userPositions,
    summaryStats,
    loading,
    refreshing,
    refreshData,
    syncPositions,
    connected: connected && !!publicKey,
    hasUser: !!user
  };
};