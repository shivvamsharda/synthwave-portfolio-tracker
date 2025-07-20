
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface CryptoDashboardCardProps {
  title: string
  value: string
  percentage: number
  chartData?: number[]
  isPositive?: boolean
}

export function CryptoDashboardCard({ 
  title, 
  value, 
  percentage, 
  chartData = [],
  isPositive = true 
}: CryptoDashboardCardProps) {
  return (
    <Card className="crypto-card p-6 h-full">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="progress-circle">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="hsl(var(--border))"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${percentage * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{percentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{isPositive ? '+' : '-'}{Math.abs(percentage)}%</span>
          </div>
        </div>
        
        {chartData.length > 0 && (
          <div className="h-12 w-full">
            <svg viewBox="0 0 100 20" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={chartData.map((val, i) => `${(i / (chartData.length - 1)) * 100},${20 - (val / Math.max(...chartData)) * 15}`).join(' ')}
                className="chart-line"
              />
              <polygon
                points={`0,20 ${chartData.map((val, i) => `${(i / (chartData.length - 1)) * 100},${20 - (val / Math.max(...chartData)) * 15}`).join(' ')} 100,20`}
                fill="url(#chartGradient)"
              />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
