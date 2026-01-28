import { StockData } from '@/types/stock';
import { TrendingUp, TrendingDown, Activity, Shield, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: StockData;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0;

  const getValuationColor = (label: string) => {
    switch (label) {
      case 'Cheap': return 'text-gain bg-gain/10';
      case 'Expensive': return 'text-loss bg-loss/10';
      default: return 'text-warning bg-warning/10';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-gain';
      case 'High': return 'text-loss';
      default: return 'text-warning';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Daily Trade': return <Activity className="w-3 h-3" />;
      case 'Swing Trade': return <Target className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "gradient-card border border-border rounded-lg p-4 cursor-pointer",
        "transition-all duration-300 hover:border-primary/50 hover:shadow-glow-accent",
        "animate-fade-in"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{stock.ticker}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold text-foreground">
            {stock.price.toLocaleString('id-ID')}
          </p>
          <div className={cn(
            "flex items-center gap-1 text-xs font-mono",
            isPositive ? "text-gain" : "text-loss"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Overall Score</span>
          <span className={cn(
            "font-mono font-semibold",
            stock.overallScore >= 70 ? "text-gain" : stock.overallScore >= 50 ? "text-warning" : "text-loss"
          )}>
            {stock.overallScore}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              stock.overallScore >= 70 ? "bg-gain" : stock.overallScore >= 50 ? "bg-warning" : "bg-loss"
            )}
            style={{ width: `${stock.overallScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">P/E</span>
          <span className="font-mono">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">PBV</span>
          <span className="font-mono">{stock.pbv.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ROE</span>
          <span className={cn("font-mono", stock.roe > 0 ? "text-gain" : "text-loss")}>
            {stock.roe.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">DER</span>
          <span className={cn("font-mono", stock.der < 1 ? "text-gain" : stock.der < 2 ? "text-warning" : "text-loss")}>
            {stock.der.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-medium",
          getValuationColor(stock.valuationLabel)
        )}>
          {stock.valuationLabel}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent flex items-center gap-1">
          {getCategoryIcon(stock.investmentCategory)}
          {stock.investmentCategory}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-medium",
          getRiskColor(stock.riskLevel),
          "bg-current/10"
        )}>
          {stock.riskLevel} Risk
        </span>
      </div>
    </div>
  );
}
