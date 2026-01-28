import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fundamentalIndicators } from '@/data/mockGoldData';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, AlertTriangle } from 'lucide-react';

export function FundamentalPanel() {
  const data = fundamentalIndicators;

  const indicators = [
    {
      label: 'USD Index (DXY)',
      value: data.usdIndex.toFixed(2),
      change: data.usdIndexChange,
      impact: data.usdIndexChange < 0 ? 'bullish' : 'bearish',
      description: 'USD strength inversely affects gold',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      label: 'Fed Funds Rate',
      value: `${data.fedFundsRate.toFixed(2)}%`,
      impact: data.fedFundsRate > 4 ? 'bearish' : 'bullish',
      description: 'Higher rates = opportunity cost for gold',
      icon: <Percent className="h-4 w-4" />
    },
    {
      label: 'Real Yield (10Y-CPI)',
      value: `${data.realYield.toFixed(2)}%`,
      impact: data.realYield > 1.5 ? 'bearish' : 'bullish',
      description: 'Negative real yields favor gold',
      icon: <Activity className="h-4 w-4" />
    },
    {
      label: 'Inflation (CPI)',
      value: `${data.inflation.toFixed(1)}%`,
      impact: data.inflation > 3 ? 'bullish' : 'neutral',
      description: 'Gold is an inflation hedge',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: 'VIX (Fear Index)',
      value: data.vix.toFixed(2),
      impact: data.vix > 20 ? 'bullish' : 'neutral',
      description: 'High fear drives safe-haven demand',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      label: 'Gold/Silver Ratio',
      value: data.goldSilverRatio.toFixed(1),
      impact: data.goldSilverRatio > 80 ? 'neutral' : 'bullish',
      description: 'Historical average ~60',
      icon: <Activity className="h-4 w-4" />
    }
  ];

  const impactStyles = {
    bullish: 'bg-gain/10 text-gain border-gain/30',
    bearish: 'bg-loss/10 text-loss border-loss/30',
    neutral: 'bg-muted text-muted-foreground border-border'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Fundamental Factors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {indicators.map((indicator, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg border ${impactStyles[indicator.impact]}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-background/50">
                  {indicator.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{indicator.label}</p>
                  <p className="text-xs opacity-70">{indicator.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold">{indicator.value}</p>
                {indicator.change !== undefined && (
                  <div className="flex items-center justify-end gap-1 text-xs">
                    {indicator.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Fundamental factors affect gold over medium to long-term horizons. 
            A weak USD, high inflation, and elevated VIX are traditionally bullish for gold prices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
