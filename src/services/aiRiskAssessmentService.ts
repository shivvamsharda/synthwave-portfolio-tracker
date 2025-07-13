interface RiskFactors {
  priceVolatility: number; // 0-100
  holderConcentration: number; // 0-100
  liquidityHealth: number; // 0-100
  organicVolume: number; // 0-100
  whaleActivity: number; // 0-100
  socialSignals: number; // 0-100
}

interface TokenRiskScore {
  overallScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  factors: RiskFactors;
  insights: string[];
  lastUpdated: Date;
}

class AIRiskAssessmentService {
  private readonly WEIGHTS = {
    priceVolatility: 0.25,
    holderConcentration: 0.20,
    liquidityHealth: 0.20,
    organicVolume: 0.15,
    whaleActivity: 0.10,
    socialSignals: 0.10
  };

  async calculateRiskScore(tokenMint: string, apiKeys: any): Promise<TokenRiskScore> {
    const factors = await this.analyzeRiskFactors(tokenMint, apiKeys);
    const overallScore = this.computeWeightedScore(factors);
    const riskLevel = this.determineRiskLevel(overallScore);
    const insights = this.generateInsights(factors, overallScore);

    return {
      overallScore: Math.round(overallScore),
      riskLevel,
      factors,
      insights,
      lastUpdated: new Date()
    };
  }

  private async analyzeRiskFactors(tokenMint: string, apiKeys: any): Promise<RiskFactors> {
    try {
      // Analyze price volatility (25% weight)
      const priceVolatility = await this.analyzePriceVolatility(tokenMint, apiKeys);
      
      // Analyze holder concentration (20% weight) 
      const holderConcentration = await this.analyzeHolderConcentration(tokenMint, apiKeys);
      
      // Analyze liquidity health (20% weight)
      const liquidityHealth = await this.analyzeLiquidityHealth(tokenMint, apiKeys);
      
      // Analyze organic volume (15% weight)
      const organicVolume = await this.analyzeOrganicVolume(tokenMint, apiKeys);
      
      // Analyze whale activity (10% weight)
      const whaleActivity = await this.analyzeWhaleActivity(tokenMint, apiKeys);
      
      // Analyze social signals (10% weight)
      const socialSignals = await this.analyzeSocialSignals(tokenMint, apiKeys);

      return {
        priceVolatility,
        holderConcentration,
        liquidityHealth,
        organicVolume,
        whaleActivity,
        socialSignals
      };
    } catch (error) {
      console.error('Error analyzing risk factors:', error);
      // Return moderate risk scores as fallback
      return {
        priceVolatility: 50,
        holderConcentration: 50,
        liquidityHealth: 50,
        organicVolume: 50,
        whaleActivity: 50,
        socialSignals: 50
      };
    }
  }

  private async analyzePriceVolatility(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { birdeyeService } = await import('./birdeyeService');
      
      if (!apiKeys?.birdeye) return 50;

      const priceData = await birdeyeService.getTokenPrice(tokenMint, apiKeys.birdeye);
      if (!priceData) return 50;

      // Calculate volatility from price changes
      const change24h = Math.abs(priceData.priceChange24h || 0);
      const volatilityScore = Math.min(change24h * 2, 100); // Scale volatility

      return volatilityScore;
    } catch (error) {
      console.error('Error analyzing price volatility:', error);
      return 50;
    }
  }

  private async analyzeHolderConcentration(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      const { whaleTrackingService } = await import('./whaleTrackingService');
      
      const concentration = await whaleTrackingService.getConcentrationData(tokenMint);
      if (!concentration) return 50;

      // Higher concentration = higher risk
      const top10Percentage = concentration.top_10_percentage || 0;
      const concentrationRisk = Math.min(top10Percentage * 2, 100);

      return concentrationRisk;
    } catch (error) {
      console.error('Error analyzing holder concentration:', error);
      return 50;
    }
  }

  private async analyzeLiquidityHealth(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      const { birdeyeService } = await import('./birdeyeService');
      
      if (!apiKeys?.birdeye) return 50;

      const marketData = await birdeyeService.getTokenOverview(tokenMint, apiKeys.birdeye);
      if (!marketData) return 50;

      const liquidity = marketData.liquidity || 0;
      const marketCap = marketData.mc || 1;
      
      // Calculate liquidity to market cap ratio
      const liquidityRatio = liquidity / marketCap;
      
      // Higher ratio = lower risk (inverse scoring)
      const healthScore = 100 - Math.min(liquidityRatio * 1000, 100);

      return healthScore;
    } catch (error) {
      console.error('Error analyzing liquidity health:', error);
      return 50;
    }
  }

  private async analyzeOrganicVolume(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      const { birdeyeService } = await import('./birdeyeService');
      
      if (!apiKeys?.birdeye) return 50;

      const overview = await birdeyeService.getTokenOverview(tokenMint, apiKeys.birdeye);
      if (!overview) return 50;

      const volume24h = overview.v24hUSD || 0;
      const marketCap = overview.mc || 1;
      
      // Calculate volume to market cap ratio
      const volumeRatio = volume24h / marketCap;
      
      // Moderate volume is healthy, extreme volume might indicate manipulation
      if (volumeRatio < 0.01) return 80; // Too low volume
      if (volumeRatio > 10) return 75; // Suspiciously high volume
      
      return 25; // Healthy volume range
    } catch (error) {
      console.error('Error analyzing organic volume:', error);
      return 50;
    }
  }

  private async analyzeWhaleActivity(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      const { whaleTrackingService } = await import('./whaleTrackingService');
      
      const whaleActivity = await whaleTrackingService.getWhaleActivity(tokenMint, 20);
      if (!whaleActivity || whaleActivity.length === 0) return 25;

      // Recent whale activity increases risk
      const recentActivity = whaleActivity.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return activityDate > oneDayAgo;
      });

      const activityScore = Math.min(recentActivity.length * 10, 100);
      return activityScore;
    } catch (error) {
      console.error('Error analyzing whale activity:', error);
      return 50;
    }
  }

  private async analyzeSocialSignals(tokenMint: string, apiKeys: any): Promise<number> {
    try {
      // For now, return moderate score since social data integration is complex
      // This could be enhanced with Twitter API, Discord sentiment, etc.
      return 40;
    } catch (error) {
      console.error('Error analyzing social signals:', error);
      return 50;
    }
  }

  private computeWeightedScore(factors: RiskFactors): number {
    return (
      factors.priceVolatility * this.WEIGHTS.priceVolatility +
      factors.holderConcentration * this.WEIGHTS.holderConcentration +
      factors.liquidityHealth * this.WEIGHTS.liquidityHealth +
      factors.organicVolume * this.WEIGHTS.organicVolume +
      factors.whaleActivity * this.WEIGHTS.whaleActivity +
      factors.socialSignals * this.WEIGHTS.socialSignals
    );
  }

  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (score <= 25) return 'LOW';
    if (score <= 50) return 'MEDIUM';
    if (score <= 75) return 'HIGH';
    return 'EXTREME';
  }

  private generateInsights(factors: RiskFactors, overallScore: number): string[] {
    const insights: string[] = [];

    if (factors.priceVolatility > 70) {
      insights.push("High price volatility detected - expect significant price swings");
    }

    if (factors.holderConcentration > 60) {
      insights.push("Token concentration is high - few wallets control large supply");
    }

    if (factors.liquidityHealth > 70) {
      insights.push("Low liquidity may cause price slippage on large trades");
    }

    if (factors.whaleActivity > 60) {
      insights.push("Recent whale activity detected - monitor large transactions");
    }

    if (factors.organicVolume > 70) {
      insights.push("Volume patterns may indicate artificial trading activity");
    }

    if (overallScore <= 25) {
      insights.push("Overall risk profile is favorable for this token");
    } else if (overallScore >= 75) {
      insights.push("Consider the high risk factors before investing");
    }

    return insights;
  }
}

export const aiRiskAssessmentService = new AIRiskAssessmentService();
export type { TokenRiskScore, RiskFactors };