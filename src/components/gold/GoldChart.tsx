import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GoldInstrument } from '@/types/gold';
import { getOHLCData } from '@/data/mockGoldData';
import { calculateAllIndicators, generateSignal } from '@/lib/technicalIndicators';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Bar, ReferenceLine, Cell
} from 'recharts';
import { format } from 'date-fns';
import { 
  TrendingUp, TrendingDown, Maximize2, BarChart2, 
  LineChartIcon, CandlestickChart, Minus
} from 'lucide-react';

interface GoldChartProps {
  instrument: GoldInstrument;
  showIndicators?: {
    sma20?: boolean;
    sma50?: boolean;
    bollinger?: boolean;
  };
}

type ChartType = 'area' | 'candle' | 'line';
type ChartPeriod = '1M' | '3M' | '6M' | '1Y';

const formatPrice = (price: number, instrument: GoldInstrument): string => {
  if (instrument === 'ANTAM') {
    return `Rp ${price.toLocaleString('id-ID')}`;
  }
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
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      {/* Body */}
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

export function GoldChart({ instrument, showIndicators = {} }: GoldChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [period, setPeriod] = useState<ChartPeriod>('3M');
  
  const ohlcData = getOHLCData(instrument);
  const indicators = useMemo(() => calculateAllIndicators(ohlcData), [ohlcData]);
  const currentPrice = ohlcData[ohlcData.length - 1].close;
  const signalResult = useMemo(() => generateSignal(indicators, currentPrice), [indicators, currentPrice]);

  const periodDays = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const closes = ohlcData.map(d => d.close);
    const days = Math.min(periodDays[period], ohlcData.length);
    
    return ohlcData.slice(-days).map((candle, index) => {
      const actualIndex = ohlcData.length - days + index;
      const priceSlice = closes.slice(0, actualIndex + 1);
      
      const sma20 = priceSlice.length >= 20 
        ? priceSlice.slice(-20).reduce((a, b) => a + b, 0) / 20 
        : null;
      const sma50 = priceSlice.length >= 50 
        ? priceSlice.slice(-50).reduce((a, b) => a + b, 0) / 50 
        : null;

      // Calculate Bollinger Bands for each point
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
        upperBand,
        lowerBand,
        isUp: candle.close >= candle.open
      };
    });
  }, [ohlcData, indicators, period]);

  // Calculate price change
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{data.fullDate}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Open:</span>
          <span className="font-mono">{formatPrice(data.open, instrument)}</span>
          <span className="text-muted-foreground">High:</span>
          <span className="font-mono text-gain">{formatPrice(data.high, instrument)}</span>
          <span className="text-muted-foreground">Low:</span>
          <span className="font-mono text-loss">{formatPrice(data.low, instrument)}</span>
          <span className="text-muted-foreground">Close:</span>
          <span className={`font-mono ${data.isUp ? 'text-gain' : 'text-loss'}`}>
            {formatPrice(data.close, instrument)}
          </span>
        </div>
        {showIndicators.sma20 && data.sma20 && (
          <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
            <span className="text-gain">SMA20: {formatPrice(data.sma20, instrument)}</span>
          </div>
        )}
      </div>
    );
  };

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
          {/* Period Selector */}
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

          {/* Chart Type Selector */}
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
                <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => instrument === 'ANTAM' ? `${(value / 1000000).toFixed(1)}M` : value.toFixed(0)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Bollinger Bands - Background fill */}
              {showIndicators.bollinger && (
                <Area
                  type="monotone"
                  dataKey="upperBand"
                  stroke="none"
                  fill="url(#bollingerGradient)"
                  fillOpacity={1}
                />
              )}
              
              {/* Bollinger Bands Lines */}
              {showIndicators.bollinger && (
                <>
                  <Line
                    type="monotone"
                    dataKey="upperBand"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                    strokeOpacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBand"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                    strokeOpacity={0.5}
                  />
                </>
              )}
              
              {/* Price - Area chart */}
              {chartType === 'area' && (
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              )}

              {/* Price - Line chart */}
              {chartType === 'line' && (
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* Candlestick bars */}
              {chartType === 'candle' && (
                <Bar
                  dataKey="high"
                  fill="transparent"
                  shape={(props: any) => {
                    const { x, y, width, payload, index } = props;
                    if (!payload) return null;
                    
                    // Get Y scale from the chart
                    const minPrice = Math.min(...chartData.map(d => d.low));
                    const maxPrice = Math.max(...chartData.map(d => d.high));
                    const chartHeight = 380;
                    const yScale = (price: number) => {
                      return ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight + 10;
                    };
                    
                    return (
                      <Candlestick
                        key={index}
                        x={x}
                        y={y}
                        width={width}
                        height={0}
                        open={payload.open}
                        close={payload.close}
                        high={payload.high}
                        low={payload.low}
                        payload={payload}
                        yScale={yScale}
                      />
                    );
                  }}
                />
              )}
              
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

              {/* Current Price Reference Line */}
              <ReferenceLine 
                y={currentPrice} 
                stroke="hsl(var(--foreground))" 
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Signal Reasons */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Technical Summary</p>
            <div className="flex items-center gap-2">
              {showIndicators.sma20 && (
                <Badge variant="outline" className="text-xs bg-gain/10 text-gain border-gain/30">
                  <div className="w-2 h-0.5 bg-gain mr-1.5" /> SMA 20
                </Badge>
              )}
              {showIndicators.sma50 && (
                <Badge variant="outline" className="text-xs bg-loss/10 text-loss border-loss/30">
                  <div className="w-2 h-0.5 bg-loss mr-1.5" /> SMA 50
                </Badge>
              )}
            </div>
          </div>
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
