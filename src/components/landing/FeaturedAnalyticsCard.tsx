import { useState, useEffect } from "react"
import { Globe } from "lucide-react"

export function FeaturedAnalyticsCard() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`transform transition-all duration-1000 hover:scale-105 hover:shadow-glow ${
          isVisible ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-10 rotate-3 opacity-0'
        }`}
        style={{ 
          perspective: '1000px',
          transform: 'rotateX(2deg) rotateY(-5deg)'
        }}
      >
        <div className="w-96 h-64 bg-card border border-border/20 rounded-2xl shadow-2xl overflow-hidden hover:shadow-glow transition-all duration-300">
          {/* Screen Content */}
          <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/5 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Global Activity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
            
            {/* World Map Visualization */}
            <div className="relative bg-background/50 rounded-lg h-32 border border-border/10 overflow-hidden mb-4">
              {/* Map dots representing crypto activity */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-20 relative">
                  {/* Continents outline */}
                  <div className="absolute inset-0 opacity-30">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      <path d="M20,15 Q30,10 45,15 Q55,20 65,15 Q75,10 85,15" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                      <path d="M15,25 Q25,30 35,25 Q45,30 55,25" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                      <path d="M10,40 Q20,45 30,40 Q40,45 50,40" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                    </svg>
                  </div>
                  
                  {/* Activity dots */}
                  <div className="absolute top-3 left-10 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow"></div>
                  <div className="absolute top-6 left-20 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-4 right-10 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow" style={{ animationDelay: '1.5s' }}></div>
                  <div className="absolute bottom-4 right-16 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-8 left-24 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-glow" style={{ animationDelay: '2.5s' }}></div>
                </div>
              </div>
              
              {/* Primary glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"></div>
            </div>
            
            {/* Stats */}
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <div className="text-primary font-bold text-lg">$2.8M</div>
                <div className="text-muted-foreground text-xs">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-bold text-lg">1,247</div>
                <div className="text-muted-foreground text-xs">Active</div>
              </div>
              <div className="text-center">
                <div className="text-success font-bold text-lg">+12.5%</div>
                <div className="text-muted-foreground text-xs">24h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}