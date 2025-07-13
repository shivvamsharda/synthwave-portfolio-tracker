import { useState, useCallback } from 'react';
import { aiRiskAssessmentService, TokenRiskScore } from '@/services/aiRiskAssessmentService';

export function useTokenRiskScore() {
  const [riskScore, setRiskScore] = useState<TokenRiskScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRiskScore = useCallback(async (tokenMint: string, apiKeys: any) => {
    if (!tokenMint) return;

    setLoading(true);
    setError(null);

    try {
      const score = await aiRiskAssessmentService.calculateRiskScore(tokenMint, apiKeys);
      setRiskScore(score);
    } catch (err) {
      console.error('Error calculating risk score:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate risk score');
      setRiskScore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRiskScore = useCallback(() => {
    setRiskScore(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    riskScore,
    loading,
    error,
    calculateRiskScore,
    clearRiskScore
  };
}