import { useMemo, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { GoldInstrument } from '@/types/gold';
import { getOHLCData } from '@/data/mockGoldData';
import { calculateAllIndicators, generateSignal } from '@/lib/technicalIndicators';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3 } from 'lucide-react';

interface TechnicalPanelProps {
  instrument: GoldInstrument;
  livePrice?: number;
}

function IndicatorRow({ 
  label, 
  value, 
  signal,
  subValue
}: { 
  label: string; 
  value: string; 
  signal: 'bullish' | 'bearish' | 'neutral';
  subValue?: string;
}) {
  const signalIcon = {
    bullish: <TrendingUp className="h-3.5 w-3.5 text-gain" />,
    bearish: <TrendingDown className="h-3.5 w-3.5 text-loss" />,
    neutral: <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  };

  const signalBg = {
    bullish: 'bg-gain/10 border-gain/20',
    bearish: 'bg-loss/10 border-loss/20',
    neutral: 'bg-muted/50 border-border'
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded-md border ${signalBg[signal]} transition-colors`}>
      <div className="flex items-center gap-2">
        {signalIcon[signal]}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-mono text-sm text-foreground font-medium">{value}</span>
        {subValue && (
          <span className="text-xs text-muted-foreground ml-1">({subValue})</span>
        )}
      </div>
    </div>
  );
}

function GaugeIndicator({ 
  value, 
  min, 
  max, 
  label,
  zones 
}: { 
  value: number; 
  min: number; 
  max: number; 
  label: string;
  zones: { start: number; end: number; color: string; label: string }[];
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const activeZone = zones.find(z => value >= z.start && value <= z.end);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`font-mono text-lg font-bold ${
          activeZone?.color === 'gain' ? 'text-gain' : 
          activeZone?.color === 'loss' ? 'text-loss' : 'text-foreground'
        }`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {zones.map((zone, i) => (
          <div
            key={i}
            className={`absolute h-full ${
              zone.color === 'gain' ? 'bg-gain/30' : 
              zone.color === 'loss' ? 'bg-loss/30' : 'bg-muted-foreground/20'
            }`}
            style={{
              left: `${((zone.start - min) / (max - min)) * 100}%`,
              width: `${((zone.end - zone.start) / (max - min)) * 100}%`
            }}
          />
        ))}
        <div 
          className="absolute h-full w-1 bg-foreground rounded-full shadow-lg transition-all duration-300"
          style={{ left: `calc(${Math.min(Math.max(percentage, 0), 100)}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {zones.map((zone, i) => (
          <span key={i}>{zone.label}</span>
        ))}
      </div>
    </div>
  );
}

export const TechnicalPanel = forwardRef<HTMLDivElement, TechnicalPanelProps>(
  function TechnicalPanel({ instrument, livePrice }, ref) {
    const ohlcData = getOHLCData(instrument, livePrice);
    const currentPrice = ohlcData[ohlcData.length - 1].close;
    const indicators = useMemo(() => calculateAllIndicators(ohlcData), [ohlcData]);
    const signalResult = useMemo(() => generateSignal(indicators, currentPrice), [indicators, currentPrice]);

    const getRSISignal = (rsi: number): 'bullish' | 'bearish' | 'neutral' => {
      if (rsi < 30) return 'bullish';
      if (rsi > 70) return 'bearish';
      return 'neutral';
    };

    const getMACDSignal = (histogram: number): 'bullish' | 'bearish' | 'neutral' => {
      if (histogram > 0.5) return 'bullish';
      if (histogram < -0.5) return 'bearish';
      return 'neutral';
    };

    const getPriceVsMASignal = (price: number, ma: number): 'bullish' | 'bearish' | 'neutral' => {
      const diff = ((price - ma) / ma) * 100;
      if (diff > 1) return 'bullish';
      if (diff < -1) return 'bearish';
      return 'neutral';
    };

    const formatValue = (value: number): string => {
      return `$${value.toFixed(2)}`;
    };

    const signalColor = {
      'Strong Buy': 'bg-gain text-gain-foreground',
      'Buy': 'bg-gain/80 text-gain-foreground',
      'Neutral': 'bg-muted text-muted-foreground',
      'Sell': 'bg-loss/80 text-loss-foreground',
      'Strong Sell': 'bg-loss text-loss-foreground'
    };

    return (
      <Card ref={ref}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Technical Analysis
            </CardTitle>
            <Badge className={signalColor[signalResult.signal]}>
              {signalResult.signal}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RSI Gauge */}
          <GaugeIndicator
            value={indicators.rsi}
            min={0}
            max={100}
            label="RSI (14)"
            zones={[
              { start: 0, end: 30, color: 'gain', label: 'Oversold' },
              { start: 30, end: 70, color: 'neutral', label: 'Neutral' },
              { start: 70, end: 100, color: 'loss', label: 'Overbought' }
            ]}
          />

          {/* ADX Gauge */}
          <GaugeIndicator
            value={indicators.adx}
            min={0}
            max={100}
            label="ADX (Trend Strength)"
            zones={[
              { start: 0, end: 20, color: 'neutral', label: 'Weak' },
              { start: 20, end: 50, color: 'gain', label: 'Strong' },
              { start: 50, end: 100, color: 'gain', label: 'Very Strong' }
            ]}
          />

          <div className="h-px bg-border" />

          {/* MACD */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Activity className="h-3 w-3" /> MACD
            </p>
            <IndicatorRow 
              label="MACD Line" 
              value={indicators.macd.macd.toFixed(4)}
              signal={getMACDSignal(indicators.macd.histogram)}
            />
            <IndicatorRow 
              label="Signal Line" 
              value={indicators.macd.signal.toFixed(4)}
              signal="neutral"
            />
            <IndicatorRow 
              label="Histogram" 
              value={indicators.macd.histogram.toFixed(4)}
              signal={getMACDSignal(indicators.macd.histogram)}
              subValue={indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Moving Averages */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Moving Averages</p>
            <IndicatorRow 
              label="SMA 20" 
              value={formatValue(indicators.sma20)}
              signal={getPriceVsMASignal(currentPrice, indicators.sma20)}
              subValue={`${((currentPrice - indicators.sma20) / indicators.sma20 * 100).toFixed(1)}%`}
            />
            <IndicatorRow 
              label="SMA 50" 
              value={formatValue(indicators.sma50)}
              signal={getPriceVsMASignal(currentPrice, indicators.sma50)}
              subValue={`${((currentPrice - indicators.sma50) / indicators.sma50 * 100).toFixed(1)}%`}
            />
            <IndicatorRow 
              label="SMA 200" 
              value={formatValue(indicators.sma200)}
              signal={getPriceVsMASignal(currentPrice, indicators.sma200)}
              subValue={`${((currentPrice - indicators.sma200) / indicators.sma200 * 100).toFixed(1)}%`}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Bollinger Bands */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Bollinger Bands (20,2)</p>
            <IndicatorRow 
              label="Upper Band" 
              value={formatValue(indicators.bollingerBands.upper)}
              signal={currentPrice >= indicators.bollingerBands.upper ? 'bearish' : 'neutral'}
            />
            <IndicatorRow 
              label="Middle Band" 
              value={formatValue(indicators.bollingerBands.middle)}
              signal="neutral"
            />
            <IndicatorRow 
              label="Lower Band" 
              value={formatValue(indicators.bollingerBands.lower)}
              signal={currentPrice <= indicators.bollingerBands.lower ? 'bullish' : 'neutral'}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Volatility */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Volatility</p>
            <IndicatorRow 
              label="ATR (14)" 
              value={formatValue(indicators.atr)}
              signal="neutral"
              subValue={`${((indicators.atr / currentPrice) * 100).toFixed(2)}%`}
            />
          </div>

          {/* Summary */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="font-mono font-bold text-lg">{signalResult.score}/100</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {signalResult.reasons.slice(0, 3).map((reason, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
