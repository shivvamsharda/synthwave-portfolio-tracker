import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Check, CheckCheck, AlertCircle } from 'lucide-react';

export function MessagingPreview() {
  const messages = [
    {
      id: 1,
      user: 'Portfolio Bot',
      message: 'Your SOL position is up 12.5% today! 🚀',
      time: '2:35 PM',
      status: 'delivered',
      type: 'bot'
    },
    {
      id: 2,
      user: 'You',
      message: 'Show me BONK analytics',
      time: '2:36 PM',
      status: 'read',
      type: 'user'
    },
    {
      id: 3,
      user: 'Analytics Bot',
      message: 'BONK whale activity detected! Large buy order: $50K',
      time: '2:37 PM',
      status: 'delivered',
      type: 'bot'
    },
    {
      id: 4,
      user: 'Alert System',
      message: 'Price alert: MATIC reached $0.85 (+5%)',
      time: '2:38 PM',
      status: 'delivered',
      type: 'alert'
    }
  ];

  return (
    <Card className="w-full max-w-md bg-card border-border/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Cryptic Chat</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">3 active bots</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Live</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
              {msg.type !== 'user' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${
                    msg.type === 'bot' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-xs text-muted-foreground font-medium">{msg.user}</span>
                </div>
              )}
              
              <div className={`rounded-lg px-3 py-2 ${
                msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-4' 
                  : msg.type === 'alert'
                  ? 'bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${
                    msg.type === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {msg.time}
                  </span>
                  {msg.type === 'user' && (
                    <div className="ml-2">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                      ) : (
                        <Check className="w-3 h-3 text-primary-foreground/50" />
                      )}
                    </div>
                  )}
                  {msg.type === 'alert' && (
                    <AlertCircle className="w-3 h-3 text-orange-500 ml-2" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about your portfolio..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Show BONK analytics" or "Alert me when SOL hits $200"
        </p>
      </div>
    </Card>
  );
}