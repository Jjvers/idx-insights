import { StockData } from '@/types/stock';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Shield, Activity, Target, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockDetailModalProps {
  stock: StockData | null;
  onClose: () => void;
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  if (!stock) return null;

  const isPositive = stock.change >= 0;

  const metrics = [
    { label: 'P/E Ratio', value: stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A', description: 'Price to Earnings' },
    { label: 'PBV', value: stock.pbv.toFixed(2), description: 'Price to Book Value' },
    { label: 'ROE', value: `${stock.roe.toFixed(2)}%`, description: 'Return on Equity', positive: stock.roe > 0 },
    { label: 'DER', value: stock.der.toFixed(2), description: 'Debt to Equity', negative: stock.der > 1.5 },
    { label: 'EPS', value: stock.eps.toFixed(2), description: 'Earnings Per Share' },
    { label: 'Beta', value: stock.beta.toFixed(2), description: 'Market Volatility' },
    { label: 'Volatility', value: `${stock.volatility.toFixed(2)}%`, description: '30-day Price Movement' },
    { label: 'Avg Volume', value: `${(stock.avgVolume / 1000000).toFixed(1)}M`, description: 'Average Daily Volume' },
  ];

  const ScoreRing = ({ score, label, size = 80 }: { score: number; label: string; size?: number }) => {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={score >= 70 ? 'hsl(var(--gain))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--loss))'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
          <span className={cn(
            "font-mono font-bold text-xl",
            score >= 70 ? "text-gain" : score >= 50 ? "text-warning" : "text-loss"
          )}>
            {score}
          </span>
        </div>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </div>
    );
  };

  // Mini sparkline chart
  const Sparkline = ({ data }: { data: number[] }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 200;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isUptrend = data[data.length - 1] > data[0];

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isUptrend ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <Dialog open={!!stock} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">{stock.ticker}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  stock.valuationLabel === 'Cheap' ? "bg-gain/20 text-gain" :
                  stock.valuationLabel === 'Expensive' ? "bg-loss/20 text-loss" :
                  "bg-warning/20 text-warning"
                )}>
                  {stock.valuationLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stock.name}</p>
              <p className="text-xs text-muted-foreground">{stock.sector}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-foreground">
                Rp {stock.price.toLocaleString('id-ID')}
              </p>
              <div className={cn(
                "flex items-center justify-end gap-1 font-mono",
                isPositive ? "text-gain" : "text-loss"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{stock.change.toLocaleString('id-ID')} ({stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="relative flex justify-center">
            <ScoreRing score={stock.overallScore} label="Overall" size={90} />
          </div>
          <div className="relative flex justify-center">
            <ScoreRing score={stock.fundamentalScore} label="Fundamental" size={90} />
          </div>
          <div className="relative flex justify-center">
            <ScoreRing score={stock.technicalScore} label="Technical" size={90} />
          </div>
        </div>

        {/* Labels */}
        <div className="flex flex-wrap gap-2 py-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
            {stock.investmentCategory === 'Long-term' && <Shield className="w-4 h-4 text-gain" />}
            {stock.investmentCategory === 'Swing Trade' && <Target className="w-4 h-4 text-warning" />}
            {stock.investmentCategory === 'Daily Trade' && <Activity className="w-4 h-4 text-accent" />}
            <span>{stock.investmentCategory}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
            stock.riskLevel === 'Low' ? "bg-gain/20 text-gain" :
            stock.riskLevel === 'High' ? "bg-loss/20 text-loss" :
            "bg-warning/20 text-warning"
          )}>
            <span>{stock.riskLevel} Risk</span>
          </div>
        </div>

        {/* Price Chart */}
        <div className="py-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">30-Day Price Trend</span>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 flex justify-center">
            <Sparkline data={stock.historicalPrices} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className={cn(
                "font-mono font-semibold",
                metric.positive && "text-gain",
                metric.negative && "text-loss"
              )}>
                {metric.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>

        {/* Market Cap & Volume */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Market Cap</span>
            </div>
            <p className="font-mono text-lg font-bold mt-1">
              Rp {(stock.marketCap / 1000000000000).toFixed(1)}T
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Today's Volume</span>
            </div>
            <p className="font-mono text-lg font-bold mt-1">
              {(stock.volume / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
