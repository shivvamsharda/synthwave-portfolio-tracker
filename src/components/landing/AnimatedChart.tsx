import React, { useEffect, useState } from 'react';

interface AnimatedChartProps {
  data: number[];
  color?: string;
  height?: number;
  animated?: boolean;
}

export function AnimatedLineChart({ data, color = "hsl(var(--primary))", height = 60, animated = true }: AnimatedChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>(animated ? [] : data);
  
  useEffect(() => {
    if (!animated) return;
    
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [data, animated]);
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const points = (animated ? animatedData : data).map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const pathD = (animated ? animatedData : data).length > 0 
    ? `M ${points.split(' ').map(p => p.split(',').join(',')).join(' L ')}`
    : '';
  
  return (
    <div className="w-full h-full relative overflow-hidden">
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="absolute inset-0">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        {pathD && (
          <path
            d={`${pathD} L 100,${height} L 0,${height} Z`}
            fill="url(#chartGradient)"
            className="transition-all duration-1000 ease-out"
          />
        )}
        
        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            stroke={color}
            strokeWidth="2"
            fill="none"
            className="transition-all duration-1000 ease-out chart-line"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`
            }}
          />
        )}
        
        {/* Data points */}
        {(animated ? animatedData : data).map((_, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = height - ((data[index] - minValue) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className={`transition-all duration-700 ease-out ${animated ? 'animate-pulse' : ''}`}
              style={{
                transitionDelay: `${index * 100}ms`,
                filter: `drop-shadow(0 0 4px ${color}60)`
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function AnimatedBarChart({ data, color = "hsl(var(--primary))", height = 60 }: AnimatedChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  const maxValue = Math.max(...data);
  
  return (
    <div className="flex items-end justify-between w-full gap-1" style={{ height }}>
      {data.map((value, index) => {
        const barHeight = (animatedData[index] || 0) / maxValue * height;
        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all duration-700 ease-out"
            style={{
              height: `${barHeight}px`,
              background: `linear-gradient(to top, ${color}, ${color}80)`,
              transitionDelay: `${index * 100}ms`,
              boxShadow: `0 0 10px ${color}40`
            }}
          />
        );
      })}
    </div>
  );
}

export function CircularProgress({ percentage, size = 80, strokeWidth = 8, color = "hsl(var(--primary))" }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circularGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}60)`
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold gradient-text">
          {Math.round(animatedPercentage)}%
        </span>
      </div>
    </div>
  );
}

export function CountingNumber({ target, duration = 2000, prefix = "", suffix = "" }) {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const increment = target / (duration / 50);
    const timer = setInterval(() => {
      setCurrent(prev => {
        const next = prev + increment;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return (
    <span className="animate-count-up">
      {prefix}{Math.floor(current).toLocaleString()}{suffix}
    </span>
  );
}