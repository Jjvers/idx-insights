import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { GoldInstrument } from '@/types/gold';
import { getOHLCData } from '@/data/mockGoldData';
import { calculateAllIndicators, calculateEMA, calculateSMA, generateSignal } from '@/lib/technicalIndicators';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Bar, ReferenceLine, Cell
} from 'recharts';
import { format } from 'date-fns';
import { 
  TrendingUp, TrendingDown, Maximize2, BarChart2, 
  LineChartIcon, CandlestickChart, Minus, Settings2
} from 'lucide-react';

interface GoldChartProps {
  instrument: GoldInstrument;
  livePrice?: number;
  showIndicators?: {
    sma20?: boolean;
    sma50?: boolean;
    ema12?: boolean;
    ema26?: boolean;
    bollinger?: boolean;
    fibonacci?: boolean;
  };
}

type ChartType = 'area' | 'candle' | 'line';
type ChartPeriod = '1M' | '3M' | '6M' | '1Y';

const formatPrice = (price: number, _instrument: GoldInstrument): string => {
  return `$${price.toFixed(2)}`;
};

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, high, low, fill, payload, yScale } = props;
  if (!payload || yScale === undefined) return null;
  
  const isUp = close >= open;
  const color = isUp ? 'hsl(var(--gain))' : 'hsl(var(--loss))';
  const candleWidth = Math.max(width * 0.6, 2);
  const wickWidth = 1;
  
  const openY = yScale(open);
  const closeY = yScale(close);
  const highY = yScale(high);
  const lowY = yScale(low);
  
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY) || 1;
  
  return (
    <g>
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      <rect
        x={x + (width - candleWidth) / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isUp ? 'transparent' : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export function GoldChart({ instrument, livePrice, showIndicators = {} }: GoldChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [period, setPeriod] = useState<ChartPeriod>('3M');
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  
  const ohlcData = getOHLCData(instrument, livePrice);
  const indicators = useMemo(() => calculateAllIndicators(ohlcData), [ohlcData]);
  const currentPrice = ohlcData[ohlcData.length - 1].close;
  const signalResult = useMemo(() => generateSignal(indicators, currentPrice), [indicators, currentPrice]);

  const periodDays = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365
  };

  // Fibonacci levels
  const fibLevels = useMemo(() => {
    const days = Math.min(periodDays[period], ohlcData.length);
    const slice = ohlcData.slice(-days);
    const highs = slice.map(d => d.high);
    const lows = slice.map(d => d.low);
    const high = Math.max(...highs);
    const low = Math.min(...lows);
    const range = high - low;
    return {
      high,
      low,
      fib236: high - range * 0.236,
      fib382: high - range * 0.382,
      fib500: high - range * 0.500,
      fib618: high - range * 0.618,
    };
  }, [ohlcData, period]);

  // Prepare chart data with EMA
  const chartData = useMemo(() => {
    const closes = ohlcData.map(d => d.close);
    const days = Math.min(periodDays[period], ohlcData.length);
    
    // Pre-calculate RSI series
    const rsiSeries: (number | null)[] = [];
    for (let i = 0; i < ohlcData.length; i++) {
      if (i < 14) { rsiSeries.push(null); continue; }
      const slice = closes.slice(0, i + 1);
      const changes = [];
      for (let j = 1; j < slice.length; j++) changes.push(slice[j] - slice[j - 1]);
      const recent = changes.slice(-14);
      let gains = 0, losses = 0;
      recent.forEach(c => { if (c > 0) gains += c; else losses += Math.abs(c); });
      const avgGain = gains / 14;
      const avgLoss = losses / 14;
      rsiSeries.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss)));
    }

    // Pre-calculate MACD series
    const macdSeries: { macd: number | null; signal: number | null; histogram: number | null }[] = [];
    const macdValues: number[] = [];
    for (let i = 0; i < ohlcData.length; i++) {
      if (i < 25) {
        macdSeries.push({ macd: null, signal: null, histogram: null });
        continue;
      }
      const slice = closes.slice(0, i + 1);
      const ema12Val = calculateEMA(slice, 12);
      const ema26Val = calculateEMA(slice, 26);
      const macdVal = ema12Val - ema26Val;
      macdValues.push(macdVal);
      const signalVal = macdValues.length >= 9 ? calculateEMA(macdValues, 9) : macdVal;
      macdSeries.push({ macd: macdVal, signal: signalVal, histogram: macdVal - signalVal });
    }
    
    return ohlcData.slice(-days).map((candle, index) => {
      const actualIndex = ohlcData.length - days + index;
      const priceSlice = closes.slice(0, actualIndex + 1);
      
      const sma20 = priceSlice.length >= 20 
        ? priceSlice.slice(-20).reduce((a, b) => a + b, 0) / 20 
        : null;
      const sma50 = priceSlice.length >= 50 
        ? priceSlice.slice(-50).reduce((a, b) => a + b, 0) / 50 
        : null;

      const ema12 = priceSlice.length >= 12 ? calculateEMA(priceSlice, 12) : null;
      const ema26 = priceSlice.length >= 26 ? calculateEMA(priceSlice, 26) : null;

      let upperBand = null;
      let lowerBand = null;
      if (priceSlice.length >= 20) {
        const slice = priceSlice.slice(-20);
        const mean = slice.reduce((a, b) => a + b, 0) / 20;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        upperBand = mean + 2 * stdDev;
        lowerBand = mean - 2 * stdDev;
      }

      return {
        date: format(candle.date, 'MMM dd'),
        fullDate: format(candle.date, 'MMM dd, yyyy'),
        price: candle.close,
        high: candle.high,
        low: candle.low,
        open: candle.open,
        close: candle.close,
        volume: candle.volume,
        sma20,
        sma50,
        ema12,
        ema26,
        upperBand,
        lowerBand,
        rsi: rsiSeries[actualIndex],
        macdLine: macdSeries[actualIndex]?.macd ?? null,
        macdSignal: macdSeries[actualIndex]?.signal ?? null,
        macdHist: macdSeries[actualIndex]?.histogram ?? null,
        isUp: candle.close >= candle.open
      };
    });
  }, [ohlcData, period]);

  const priceChange = chartData.length >= 2 
    ? chartData[chartData.length - 1].price - chartData[0].price 
    : 0;
  const priceChangePercent = chartData.length >= 2 
    ? (priceChange / chartData[0].price) * 100 
    : 0;

  const signalColor = {
    'Strong Buy': 'bg-gain text-gain-foreground',
    'Buy': 'bg-gain/80 text-gain-foreground',
    'Neutral': 'bg-muted text-muted-foreground',
    'Sell': 'bg-loss/80 text-loss-foreground',
    'Strong Sell': 'bg-loss text-loss-foreground'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="text-sm font-medium text-foreground mb-2">{data.fullDate}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-muted-foreground">O:</span>
          <span className="font-mono">{formatPrice(data.open, instrument)}</span>
          <span className="text-muted-foreground">H:</span>
          <span className="font-mono text-gain">{formatPrice(data.high, instrument)}</span>
          <span className="text-muted-foreground">L:</span>
          <span className="font-mono text-loss">{formatPrice(data.low, instrument)}</span>
          <span className="text-muted-foreground">C:</span>
          <span className={`font-mono ${data.isUp ? 'text-gain' : 'text-loss'}`}>
            {formatPrice(data.close, instrument)}
          </span>
        </div>
        {data.rsi != null && (
          <div className="mt-1 pt-1 border-t border-border">
            <span className="text-muted-foreground">RSI: </span>
            <span className={`font-mono ${data.rsi > 70 ? 'text-loss' : data.rsi < 30 ? 'text-gain' : 'text-foreground'}`}>
              {data.rsi.toFixed(1)}
            </span>
          </div>
        )}
        {data.macdLine != null && (
          <div>
            <span className="text-muted-foreground">MACD: </span>
            <span className={`font-mono ${data.macdHist > 0 ? 'text-gain' : 'text-loss'}`}>
              {data.macdLine.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const mainChartHeight = showRSI || showMACD ? 280 : 400;
  const subChartHeight = 100;

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{instrument}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold">
                {formatPrice(currentPrice, instrument)}
              </span>
              <span className={`flex items-center gap-1 text-sm font-mono ${
                priceChange >= 0 ? 'text-gain' : 'text-loss'
              }`}>
                {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={signalColor[signalResult.signal]}>
              {signalResult.signal}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Score: {signalResult.score}/100
            </span>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            {(['1M', '3M', '6M', '1Y'] as ChartPeriod[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <Button
              variant={chartType === 'area' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setChartType('area')}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'candle' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setChartType('candle')}
            >
              <CandlestickChart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Indicator Toggles - TradingView style toolbar */}
        <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            Indicators:
          </span>
          {/* MA Overlays */}
          <div className="flex items-center gap-3 border-r border-border pr-3">
            {showIndicators.sma20 !== undefined && (
              <Badge variant="outline" className="text-[10px] bg-gain/10 text-gain border-gain/30 cursor-default">
                <div className="w-2 h-0.5 bg-gain mr-1" /> SMA20
              </Badge>
            )}
            {showIndicators.sma50 !== undefined && showIndicators.sma50 && (
              <Badge variant="outline" className="text-[10px] bg-loss/10 text-loss border-loss/30 cursor-default">
                <div className="w-2 h-0.5 bg-loss mr-1" /> SMA50
              </Badge>
            )}
            {showIndicators.ema12 && (
              <Badge variant="outline" className="text-[10px] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/30 cursor-default">
                <div className="w-2 h-0.5 bg-[hsl(var(--accent))] mr-1" /> EMA12
              </Badge>
            )}
            {showIndicators.ema26 && (
              <Badge variant="outline" className="text-[10px] bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 cursor-default">
                <div className="w-2 h-0.5 bg-[hsl(var(--warning))] mr-1" /> EMA26
              </Badge>
            )}
            {showIndicators.bollinger && (
              <Badge variant="outline" className="text-[10px] cursor-default">
                <div className="w-2 h-0.5 bg-muted-foreground mr-1" /> BB
              </Badge>
            )}
            {showIndicators.fibonacci && (
              <Badge variant="outline" className="text-[10px] bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 cursor-default">
                Fib
              </Badge>
            )}
          </div>
          {/* Sub-chart toggles */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                showRSI ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              RSI
            </button>
            <button 
              onClick={() => setShowMACD(!showMACD)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                showMACD ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              MACD
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Price Chart */}
        <div style={{ height: mainChartHeight }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value.toFixed(0)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Fibonacci Levels */}
              {showIndicators.fibonacci && (
                <>
                  <ReferenceLine y={fibLevels.fib236} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: '23.6%', position: 'right', fill: 'hsl(var(--warning))', fontSize: 9 }} />
                  <ReferenceLine y={fibLevels.fib382} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: '38.2%', position: 'right', fill: 'hsl(var(--warning))', fontSize: 9 }} />
                  <ReferenceLine y={fibLevels.fib500} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.8} label={{ value: '50.0%', position: 'right', fill: 'hsl(var(--warning))', fontSize: 9 }} />
                  <ReferenceLine y={fibLevels.fib618} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: '61.8%', position: 'right', fill: 'hsl(var(--warning))', fontSize: 9 }} />
                </>
              )}
              
              {/* Bollinger Bands */}
              {showIndicators.bollinger && (
                <>
                  <Area type="monotone" dataKey="upperBand" stroke="none" fill="url(#bollingerGradient)" fillOpacity={1} />
                  <Line type="monotone" dataKey="upperBand" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="lowerBand" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                </>
              )}
              
              {/* Price */}
              {chartType === 'area' && (
                <Area type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#priceGradient)" />
              )}
              {chartType === 'line' && (
                <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              )}
              {chartType === 'candle' && (
                <Bar
                  dataKey="high"
                  fill="transparent"
                  shape={(props: any) => {
                    const { x, y, width, payload, index } = props;
                    if (!payload) return null;
                    const minPrice = Math.min(...chartData.map(d => d.low));
                    const maxPrice = Math.max(...chartData.map(d => d.high));
                    const chartHeight = mainChartHeight - 30;
                    const yScale = (price: number) => ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight + 10;
                    return (
                      <Candlestick key={index} x={x} y={y} width={width} height={0}
                        open={payload.open} close={payload.close} high={payload.high} low={payload.low}
                        payload={payload} yScale={yScale} />
                    );
                  }}
                />
              )}
              
              {/* Moving Averages */}
              {showIndicators.sma20 && (
                <Line type="monotone" dataKey="sma20" stroke="hsl(var(--gain))" strokeWidth={1.5} dot={false} name="SMA 20" />
              )}
              {showIndicators.sma50 && (
                <Line type="monotone" dataKey="sma50" stroke="hsl(var(--loss))" strokeWidth={1.5} dot={false} name="SMA 50" />
              )}

              {/* EMA Lines */}
              {showIndicators.ema12 && (
                <Line type="monotone" dataKey="ema12" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} name="EMA 12" strokeDasharray="3 2" />
              )}
              {showIndicators.ema26 && (
                <Line type="monotone" dataKey="ema26" stroke="hsl(var(--warning))" strokeWidth={1.5} dot={false} name="EMA 26" strokeDasharray="3 2" />
              )}

              {/* Current Price Reference */}
              <ReferenceLine y={currentPrice} stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeOpacity={0.3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Sub-Chart */}
        {showRSI && (
          <div className="mt-1 border-t border-border pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-medium">RSI (14)</span>
              <span className={`text-[10px] font-mono ${
                (chartData[chartData.length - 1]?.rsi ?? 50) > 70 ? 'text-loss' :
                (chartData[chartData.length - 1]?.rsi ?? 50) < 30 ? 'text-gain' : 'text-foreground'
              }`}>
                {(chartData[chartData.length - 1]?.rsi ?? 0).toFixed(1)}
              </span>
            </div>
            <div style={{ height: subChartHeight }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={false} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} width={60} ticks={[30, 50, 70]} />
                  <ReferenceLine y={70} stroke="hsl(var(--loss))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={30} stroke="hsl(var(--gain))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Area type="monotone" dataKey="rsi" stroke="hsl(var(--accent))" strokeWidth={1.5} fill="hsl(var(--accent))" fillOpacity={0.1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MACD Sub-Chart */}
        {showMACD && (
          <div className="mt-1 border-t border-border pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-medium">MACD (12,26,9)</span>
              <span className={`text-[10px] font-mono ${
                (chartData[chartData.length - 1]?.macdHist ?? 0) >= 0 ? 'text-gain' : 'text-loss'
              }`}>
                {(chartData[chartData.length - 1]?.macdLine ?? 0).toFixed(4)}
              </span>
            </div>
            <div style={{ height: subChartHeight }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={false} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} width={60} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                  <Bar dataKey="macdHist" fill="hsl(var(--gain))" maxBarSize={4}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={(entry.macdHist ?? 0) >= 0 ? 'hsl(var(--gain))' : 'hsl(var(--loss))'} fillOpacity={0.6} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="macdLine" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="macdSignal" stroke="hsl(var(--loss))" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Signal Reasons */}
        <div className="mt-3 pt-3 border-t border-border">
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
