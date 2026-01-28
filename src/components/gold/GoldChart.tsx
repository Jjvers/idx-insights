import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GoldInstrument, OHLC, TechnicalIndicators } from '@/types/gold';
import { getOHLCData } from '@/data/mockGoldData';
import { calculateAllIndicators, generateSignal } from '@/lib/technicalIndicators';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Bar, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface GoldChartProps {
  instrument: GoldInstrument;
  showIndicators?: {
    sma20?: boolean;
    sma50?: boolean;
    bollinger?: boolean;
  };
}

const formatPrice = (price: number, instrument: GoldInstrument): string => {
  if (instrument === 'ANTAM') {
    return `Rp ${price.toLocaleString('id-ID')}`;
  }
  return `$${price.toFixed(2)}`;
};

export function GoldChart({ instrument, showIndicators = {} }: GoldChartProps) {
  const ohlcData = getOHLCData(instrument);
  const indicators = useMemo(() => calculateAllIndicators(ohlcData), [ohlcData]);
  const currentPrice = ohlcData[ohlcData.length - 1].close;
  const signalResult = useMemo(() => generateSignal(indicators, currentPrice), [indicators, currentPrice]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const closes = ohlcData.map(d => d.close);
    
    return ohlcData.slice(-60).map((candle, index) => {
      const actualIndex = ohlcData.length - 60 + index;
      const priceSlice = closes.slice(0, actualIndex + 1);
      
      // Calculate moving averages for each point
      const sma20 = priceSlice.length >= 20 
        ? priceSlice.slice(-20).reduce((a, b) => a + b, 0) / 20 
        : null;
      const sma50 = priceSlice.length >= 50 
        ? priceSlice.slice(-50).reduce((a, b) => a + b, 0) / 50 
        : null;

      return {
        date: format(candle.date, 'MMM dd'),
        price: candle.close,
        high: candle.high,
        low: candle.low,
        open: candle.open,
        volume: candle.volume,
        sma20,
        sma50,
        upperBand: indicators.bollingerBands.upper,
        lowerBand: indicators.bollingerBands.lower
      };
    });
  }, [ohlcData, indicators]);

  const signalColor = {
    'Strong Buy': 'bg-gain text-gain-foreground',
    'Buy': 'bg-gain/80 text-gain-foreground',
    'Neutral': 'bg-muted text-muted-foreground',
    'Sell': 'bg-loss/80 text-loss-foreground',
    'Strong Sell': 'bg-loss text-loss-foreground'
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Chart - {instrument}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={signalColor[signalResult.signal]}>
              {signalResult.signal}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Score: {signalResult.score}/100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => instrument === 'ANTAM' ? `${(value / 1000000).toFixed(2)}M` : value.toFixed(0)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [formatPrice(value, instrument), '']}
              />
              
              {/* Bollinger Bands */}
              {showIndicators.bollinger && (
                <>
                  <Area
                    type="monotone"
                    dataKey="upperBand"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    fill="none"
                    strokeOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBand"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    fill="none"
                    strokeOpacity={0.5}
                  />
                </>
              )}
              
              {/* Price line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
              
              {/* Moving Averages */}
              {showIndicators.sma20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="hsl(var(--gain))"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 20"
                />
              )}
              {showIndicators.sma50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="hsl(var(--loss))"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 50"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Signal Reasons */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-2">Technical Analysis</p>
          <div className="flex flex-wrap gap-2">
            {signalResult.reasons.slice(0, 4).map((reason, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
