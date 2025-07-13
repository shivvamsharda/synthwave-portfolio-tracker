import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';
import { jupiterTrendingService, TrendingToken, TrendingCategory, TrendingInterval } from '@/services/jupiterTrendingService';
import { formatNumber, formatPrice } from '@/lib/utils';

interface TrendingTokensDashboardProps {
  onTokenSelect: (token: TrendingToken) => void;
}

export function TrendingTokensDashboard({ onTokenSelect }: TrendingTokensDashboardProps) {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<TrendingCategory>('toptrending');
  const [interval, setInterval] = useState<TrendingInterval>('1h');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrendingTokens = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const trendingTokens = await jupiterTrendingService.getTrendingTokens(category, interval);
      setTokens(trendingTokens);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch trending tokens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, interval]);

  const handleRefresh = React.useCallback(() => {
    fetchTrendingTokens(true);
  }, [fetchTrendingTokens]);

  useEffect(() => {
    fetchTrendingTokens();
  }, [fetchTrendingTokens]);

  // Auto-refresh disabled for now to avoid TypeScript issues
  // useEffect(() => {
  //   const intervalId = setInterval(handleRefresh, 60000);
  //   return () => clearInterval(intervalId);
  // }, [handleRefresh]);

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getStatsForInterval = (token: TrendingToken) => {
    switch (interval) {
      case '5m':
        return token.stats5m;
      case '1h':
        return token.stats1h;
      case '6h':
        return token.stats6h;
      case '24h':
        return token.stats24h;
      default:
        return token.stats1h;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trending Tokens</h2>
          <p className="text-muted-foreground">
            Discover what's trending in the market right now
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={(value: TrendingCategory) => setCategory(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toptrending">Top Trending</SelectItem>
              <SelectItem value="toporganicscore">Top Organic Score</SelectItem>
              <SelectItem value="toptraded">Top Traded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={interval} onValueChange={(value: TrendingInterval) => setInterval(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-muted rounded" />
                    <div className="w-16 h-3 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-muted rounded" />
                  <div className="w-32 h-3 bg-muted rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token) => {
            const stats = getStatsForInterval(token);
            return (
              <Card
                key={token.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onTokenSelect(token)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-sm">{token.symbol}</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    {token.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${formatPrice(token.usdPrice)}
                      </span>
                      <div className={`flex items-center space-x-1 ${getPriceChangeColor(stats.priceChange)}`}>
                        {getPriceChangeIcon(stats.priceChange)}
                        <span className="text-sm font-medium">
                          {stats.priceChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium">
                          ${formatNumber(stats.buyVolume + stats.sellVolume)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Holders:</span>
                        <span className="font-medium">
                          {formatNumber(token.holderCount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground">Organic Score: </span>
                        <Badge variant={token.organicScore >= 90 ? "default" : "secondary"} className="text-xs">
                          {token.organicScore.toFixed(0)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MCap: </span>
                        <span className="font-medium">${formatNumber(token.mcap)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}