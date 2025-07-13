import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, TrendingUp, Users, Droplets, Activity, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { TokenRiskScore as TokenRiskScoreType } from "@/services/aiRiskAssessmentService";

interface TokenRiskScoreProps {
  riskScore: TokenRiskScoreType;
  loading?: boolean;
}

export function TokenRiskScore({ riskScore, loading = false }: TokenRiskScoreProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'EXTREME': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBorder = (level: string) => {
    switch (level) {
      case 'LOW': return 'border-green-200';
      case 'MEDIUM': return 'border-yellow-200';
      case 'HIGH': return 'border-orange-200';
      case 'EXTREME': return 'border-red-200';
      default: return 'border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'MEDIUM': return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'EXTREME': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'priceVolatility': return <TrendingUp className="w-4 h-4" />;
      case 'holderConcentration': return <Users className="w-4 h-4" />;
      case 'liquidityHealth': return <Droplets className="w-4 h-4" />;
      case 'organicVolume': return <Activity className="w-4 h-4" />;
      case 'whaleActivity': return <Activity className="w-4 h-4" />;
      case 'socialSignals': return <MessageSquare className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getFactorName = (factor: string) => {
    switch (factor) {
      case 'priceVolatility': return 'Price Volatility';
      case 'holderConcentration': return 'Holder Concentration';
      case 'liquidityHealth': return 'Liquidity Health';
      case 'organicVolume': return 'Organic Volume';
      case 'whaleActivity': return 'Whale Activity';
      case 'socialSignals': return 'Social Signals';
      default: return factor;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${getRiskBorder(riskScore.riskLevel)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Risk Assessment
          </div>
          <Badge 
            variant="secondary" 
            className={`${getRiskColor(riskScore.riskLevel)} text-white`}
          >
            {riskScore.riskLevel} RISK
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Risk Score</span>
            <div className="flex items-center gap-2">
              {getRiskIcon(riskScore.riskLevel)}
              <span className="text-2xl font-bold">{riskScore.overallScore}/100</span>
            </div>
          </div>
          <Progress value={riskScore.overallScore} className="h-2" />
        </div>

        {/* Risk Factors Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Risk Factors Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(riskScore.factors).map(([factor, value]) => (
              <div key={factor} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getFactorIcon(factor)}
                    <span>{getFactorName(factor)}</span>
                  </div>
                  <span className="font-medium">{value}/100</span>
                </div>
                <Progress value={value} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {riskScore.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">AI Insights</h4>
            <div className="space-y-2">
              {riskScore.insights.map((insight, index) => (
                <Alert key={index} className="py-2">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {insight}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground">
          Last updated: {riskScore.lastUpdated.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}