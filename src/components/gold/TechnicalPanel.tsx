import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { GoldInstrument, TechnicalIndicators } from '@/types/gold';
import { getOHLCData } from '@/data/mockGoldData';
import { calculateAllIndicators } from '@/lib/technicalIndicators';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalPanelProps {
  instrument: GoldInstrument;
}

function IndicatorRow({ 
  label, 
  value, 
  signal 
}: { 
  label: string; 
  value: string; 
  signal: 'bullish' | 'bearish' | 'neutral';
}) {
  const signalIcon = {
    bullish: <TrendingUp className="h-4 w-4 text-gain" />,
    bearish: <TrendingDown className="h-4 w-4 text-loss" />,
    neutral: <Minus className="h-4 w-4 text-muted-foreground" />
  };

  const signalBg = {
    bullish: 'bg-gain/10',
    bearish: 'bg-loss/10',
    neutral: 'bg-muted'
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded ${signalBg[signal]}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-foreground">{value}</span>
        {signalIcon[signal]}
      </div>
    </div>
  );
}

export function TechnicalPanel({ instrument }: TechnicalPanelProps) {
  const ohlcData = getOHLCData(instrument);
  const currentPrice = ohlcData[ohlcData.length - 1].close;
  const indicators = useMemo(() => calculateAllIndicators(ohlcData), [ohlcData]);

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
    if (instrument === 'ANTAM') {
      return `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* RSI */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">RSI (14)</span>
            <span className={`font-mono ${
              indicators.rsi < 30 ? 'text-gain' : 
              indicators.rsi > 70 ? 'text-loss' : 'text-foreground'
            }`}>
              {indicators.rsi.toFixed(1)}
            </span>
          </div>
          <div className="relative">
            <Progress value={indicators.rsi} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>0 (Oversold)</span>
              <span>50</span>
              <span>100 (Overbought)</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-3" />

        {/* MACD */}
        <IndicatorRow 
          label="MACD" 
          value={indicators.macd.macd.toFixed(4)}
          signal={getMACDSignal(indicators.macd.histogram)}
        />
        <IndicatorRow 
          label="MACD Signal" 
          value={indicators.macd.signal.toFixed(4)}
          signal="neutral"
        />
        <IndicatorRow 
          label="Histogram" 
          value={indicators.macd.histogram.toFixed(4)}
          signal={getMACDSignal(indicators.macd.histogram)}
        />

        <div className="h-px bg-border my-3" />

        {/* Moving Averages */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Moving Averages</p>
        <IndicatorRow 
          label="SMA 20" 
          value={formatValue(indicators.sma20)}
          signal={getPriceVsMASignal(currentPrice, indicators.sma20)}
        />
        <IndicatorRow 
          label="SMA 50" 
          value={formatValue(indicators.sma50)}
          signal={getPriceVsMASignal(currentPrice, indicators.sma50)}
        />
        <IndicatorRow 
          label="SMA 200" 
          value={formatValue(indicators.sma200)}
          signal={getPriceVsMASignal(currentPrice, indicators.sma200)}
        />

        <div className="h-px bg-border my-3" />

        {/* Bollinger Bands */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Bollinger Bands</p>
        <IndicatorRow 
          label="Upper" 
          value={formatValue(indicators.bollingerBands.upper)}
          signal={currentPrice >= indicators.bollingerBands.upper ? 'bearish' : 'neutral'}
        />
        <IndicatorRow 
          label="Middle" 
          value={formatValue(indicators.bollingerBands.middle)}
          signal="neutral"
        />
        <IndicatorRow 
          label="Lower" 
          value={formatValue(indicators.bollingerBands.lower)}
          signal={currentPrice <= indicators.bollingerBands.lower ? 'bullish' : 'neutral'}
        />

        <div className="h-px bg-border my-3" />

        {/* Other */}
        <IndicatorRow 
          label="ATR (14)" 
          value={formatValue(indicators.atr)}
          signal="neutral"
        />
        <IndicatorRow 
          label="ADX" 
          value={indicators.adx.toFixed(1)}
          signal={indicators.adx > 25 ? 'bullish' : 'neutral'}
        />
      </CardContent>
    </Card>
  );
}
