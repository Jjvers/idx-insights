import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GoldInstrument, GoldPrice } from '@/types/gold';
import { currentPrices } from '@/data/mockGoldData';
import { TrendingUp, TrendingDown, DollarSign, Coins, BarChart3 } from 'lucide-react';

interface GoldPriceCardsProps {
  selectedInstrument: GoldInstrument;
  onSelectInstrument: (instrument: GoldInstrument) => void;
}

const instrumentLabels: Record<GoldInstrument, { name: string; description: string; icon: React.ReactNode }> = {
  'XAU/USD': { name: 'XAU/USD', description: 'Spot Gold', icon: <DollarSign className="h-5 w-5" /> },
  'GOLD_FUTURES': { name: 'Gold Futures', description: 'COMEX GC', icon: <BarChart3 className="h-5 w-5" /> },
  'ANTAM': { name: 'Antam', description: 'Emas Indonesia', icon: <Coins className="h-5 w-5" /> }
};

const formatPrice = (price: number, instrument: GoldInstrument): string => {
  if (instrument === 'ANTAM') {
    return `Rp ${price.toLocaleString('id-ID')}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function GoldPriceCards({ selectedInstrument, onSelectInstrument }: GoldPriceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.keys(currentPrices) as GoldInstrument[]).map((instrument) => {
        const price = currentPrices[instrument];
        const info = instrumentLabels[instrument];
        const isSelected = instrument === selectedInstrument;
        const isPositive = price.change >= 0;

        return (
          <Card 
            key={instrument}
            className={`cursor-pointer transition-all hover:border-accent ${
              isSelected ? 'border-accent bg-accent/5' : 'border-border'
            }`}
            onClick={() => onSelectInstrument(instrument)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{info.name}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                    Active
                  </Badge>
                )}
              </div>
              
              <div className="mt-3">
                <p className="text-2xl font-bold font-mono text-foreground">
                  {formatPrice(price.price, instrument)}
                </p>
                <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-mono text-sm">
                    {isPositive ? '+' : ''}{formatPrice(price.change, instrument)} ({isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="font-mono text-sm">{formatPrice(price.open, instrument)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="font-mono text-sm text-gain">{formatPrice(price.high, instrument)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="font-mono text-sm text-loss">{formatPrice(price.low, instrument)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
