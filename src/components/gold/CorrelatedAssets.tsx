import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { correlatedAssets } from '@/data/mockGoldData';
import type { CorrelatedAsset } from '@/types/gold';
import { TrendingUp, TrendingDown, Link2, ArrowRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

function MiniSparkline({ prices, isPositive }: { prices: number[]; isPositive: boolean }) {
  const data = prices.slice(-15).map((p, i) => ({ v: p }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={isPositive ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CorrelationBar({ value }: { value: number }) {
  const width = Math.abs(value) * 100;
  const isPositive = value > 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="absolute inset-0 flex">
          <div className="w-1/2" />
          <div className="w-1/2" />
        </div>
        <div
          className={`h-full rounded-full absolute top-0 ${isPositive ? 'bg-gain' : 'bg-loss'}`}
          style={{
            width: `${width / 2}%`,
            left: isPositive ? '50%' : `${50 - width / 2}%`,
          }}
        />
      </div>
      <span className={`text-xs font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
        {value > 0 ? '+' : ''}{value.toFixed(2)}
      </span>
    </div>
  );
}

function AssetCard({ asset }: { asset: CorrelatedAsset }) {
  const isPositive = asset.changePercent >= 0;
  const isLeading = asset.lagDays < 0;

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-foreground">{asset.symbol}</span>
            <Badge
              variant="outline"
              className={`text-[10px] ${isLeading ? 'bg-accent/10 text-accent border-accent/30' : 'bg-muted text-muted-foreground'}`}
            >
              {isLeading ? '🔮 Leading' : '📊 Lagging'}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{asset.name}</span>
        </div>
        <MiniSparkline prices={asset.recentPrices} isPositive={isPositive} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-lg font-bold text-foreground">
          {asset.symbol === 'UST10Y' ? `${asset.price.toFixed(2)}%` : `$${asset.price.toFixed(2)}`}
        </span>
        <span className={`flex items-center gap-1 text-sm font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Correlation w/ Gold</span>
          <CorrelationBar value={asset.correlation} />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>{asset.lagDescription}</span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{asset.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

export function CorrelatedAssets() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-accent" />
          Correlated Assets
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Aset yang berkorelasi dengan gold. Leading indicator bergerak duluan sebelum gold,
                  sehingga bisa digunakan sebagai sinyal awal untuk memprediksi pergerakan harga emas.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlatedAssets.map(asset => (
            <AssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
