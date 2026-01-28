import { StockData } from '@/types/stock';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketOverviewProps {
  stocks: StockData[];
}

export function MarketOverview({ stocks }: MarketOverviewProps) {
  const gainers = stocks.filter(s => s.change > 0).length;
  const losers = stocks.filter(s => s.change < 0).length;
  const unchanged = stocks.filter(s => s.change === 0).length;
  
  const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
  const avgScore = stocks.reduce((sum, s) => sum + s.overallScore, 0) / stocks.length;
  
  const topGainer = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
  const topScorer = [...stocks].sort((a, b) => b.overallScore - a.overallScore)[0];

  const stats = [
    {
      icon: TrendingUp,
      label: 'Gainers',
      value: gainers,
      color: 'text-gain',
      bgColor: 'bg-gain/10',
    },
    {
      icon: TrendingDown,
      label: 'Losers',
      value: losers,
      color: 'text-loss',
      bgColor: 'bg-loss/10',
    },
    {
      icon: Activity,
      label: 'Unchanged',
      value: unchanged,
      color: 'text-muted-foreground',
      bgColor: 'bg-secondary',
    },
    {
      icon: BarChart2,
      label: 'Total Volume',
      value: `${(totalVolume / 1000000000).toFixed(1)}B`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: DollarSign,
      label: 'Avg Score',
      value: avgScore.toFixed(0),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-lg p-3 flex flex-col items-center justify-center",
              stat.bgColor
            )}
          >
            <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
            <span className={cn("font-mono font-bold text-lg", stat.color)}>{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-3 gap-3">
        {/* Top Gainer */}
        <div className="gradient-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gain" />
            <span className="text-xs text-muted-foreground">Top Gainer</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{topGainer?.ticker}</span>
            <span className="font-mono text-gain">+{topGainer?.changePercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Top Loser */}
        <div className="gradient-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-loss" />
            <span className="text-xs text-muted-foreground">Top Loser</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{topLoser?.ticker}</span>
            <span className="font-mono text-loss">{topLoser?.changePercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Top Scorer */}
        <div className="gradient-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Top Score</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{topScorer?.ticker}</span>
            <span className="font-mono text-primary">{topScorer?.overallScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
