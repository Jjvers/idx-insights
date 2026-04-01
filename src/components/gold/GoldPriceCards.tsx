import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GoldInstrument } from '@/types/gold';
import { TrendingUp, TrendingDown, DollarSign, Coins, Loader2 } from 'lucide-react';
import type { LiveGoldPrices } from '@/hooks/useGoldPrices';

interface GoldPriceCardsProps {
  selectedInstrument: GoldInstrument;
  onSelectInstrument: (instrument: GoldInstrument) => void;
  livePrices?: LiveGoldPrices | null;
  isLoading?: boolean;
}

const instrumentLabels: Record<GoldInstrument, { name: string; description: string; icon: React.ReactNode }> = {
  'XAU/USD': { name: 'XAU/USD', description: 'Spot Gold', icon: <DollarSign className="h-5 w-5" /> },
  'XAG/USD': { name: 'XAG/USD', description: 'Spot Silver', icon: <Coins className="h-5 w-5" /> },
};

const formatPrice = (price: number): string => {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function GoldPriceCards({ selectedInstrument, onSelectInstrument, livePrices, isLoading }: GoldPriceCardsProps) {
  const instruments: GoldInstrument[] = ['XAU/USD', 'XAG/USD'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {instruments.map((instrument) => {
        const info = instrumentLabels[instrument];
        const isSelected = instrument === selectedInstrument;
        const isLive = !!livePrices;

        // Use real API data
        const isXAU = instrument === 'XAU/USD';
        const price = livePrices ? (isXAU ? livePrices.XAU : livePrices.XAG) : 0;
        const open = livePrices ? (isXAU ? livePrices.XAU_open : livePrices.XAG_open) : 0;
        const high = livePrices ? (isXAU ? livePrices.XAU_high : livePrices.XAG_high) : 0;
        const low = livePrices ? (isXAU ? livePrices.XAU_low : livePrices.XAG_low) : 0;
        const change = livePrices ? (isXAU ? livePrices.XAU_change : livePrices.XAG_change) : 0;
        const changePercent = livePrices ? (isXAU ? livePrices.XAU_changePercent : livePrices.XAG_changePercent) : 0;
        const isPositive = change >= 0;

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
                <div className="flex items-center gap-1.5">
                  {isLive && (
                    <Badge variant="outline" className="bg-gain/10 text-gain border-gain/30 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gain mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  )}
                  {isSelected && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Loading live price...</span>
                  </div>
                ) : livePrices ? (
                  <>
                    <p className="text-2xl font-bold font-mono text-foreground">
                      {formatPrice(price)}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-mono text-sm">
                        {isPositive ? '+' : ''}{formatPrice(change)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No data available</p>
                )}
              </div>

              {livePrices && !isLoading && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Open</p>
                    <p className="font-mono text-sm">{formatPrice(open)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">High</p>
                    <p className="font-mono text-sm text-gain">{formatPrice(high)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Low</p>
                    <p className="font-mono text-sm text-loss">{formatPrice(low)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
