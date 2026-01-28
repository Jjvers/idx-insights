import { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fundamentalIndicators } from '@/data/mockGoldData';
import { 
  TrendingUp, TrendingDown, DollarSign, Percent, 
  Activity, AlertTriangle, Scale, Landmark 
} from 'lucide-react';

export const FundamentalPanel = forwardRef<HTMLDivElement>(
  function FundamentalPanel(_props, ref) {
    const data = fundamentalIndicators;

    // Calculate overall fundamental score
    const calculateFundamentalScore = () => {
      let score = 50;
      
      // USD weakness is bullish for gold
      if (data.usdIndexChange < 0) score += Math.min(Math.abs(data.usdIndexChange) * 10, 15);
      else score -= Math.min(data.usdIndexChange * 10, 15);
      
      // High inflation is bullish for gold
      if (data.inflation > 3) score += 10;
      else if (data.inflation < 2) score -= 5;
      
      // High VIX (fear) is bullish for gold
      if (data.vix > 25) score += 15;
      else if (data.vix > 20) score += 10;
      
      // Negative real yields are bullish for gold
      if (data.realYield < 0) score += 15;
      else if (data.realYield < 1) score += 5;
      else score -= 10;
      
      return Math.min(Math.max(Math.round(score), 0), 100);
    };

    const fundamentalScore = calculateFundamentalScore();

    const indicators = [
      {
        label: 'USD Index (DXY)',
        value: data.usdIndex.toFixed(2),
        change: data.usdIndexChange,
        impact: data.usdIndexChange < 0 ? 'bullish' : 'bearish',
        description: 'Inverse correlation with gold',
        icon: <DollarSign className="h-4 w-4" />,
        insight: data.usdIndexChange < 0 
          ? 'Dollar weakness supports gold prices' 
          : 'Dollar strength pressures gold'
      },
      {
        label: 'Fed Funds Rate',
        value: `${data.fedFundsRate.toFixed(2)}%`,
        impact: data.fedFundsRate > 4 ? 'bearish' : 'bullish',
        description: 'Opportunity cost for gold',
        icon: <Landmark className="h-4 w-4" />,
        insight: data.fedFundsRate > 4 
          ? 'High rates increase holding cost' 
          : 'Low rates support gold as alternative'
      },
      {
        label: 'Real Yield (10Y-CPI)',
        value: `${data.realYield.toFixed(2)}%`,
        impact: data.realYield > 1.5 ? 'bearish' : data.realYield < 0 ? 'bullish' : 'neutral',
        description: 'Treasury yield minus inflation',
        icon: <Percent className="h-4 w-4" />,
        insight: data.realYield < 0 
          ? 'Negative real yields are bullish for gold' 
          : 'Positive real yields compete with gold'
      },
      {
        label: 'Inflation (CPI)',
        value: `${data.inflation.toFixed(1)}%`,
        impact: data.inflation > 3 ? 'bullish' : 'neutral',
        description: 'Gold is an inflation hedge',
        icon: <TrendingUp className="h-4 w-4" />,
        insight: data.inflation > 3 
          ? 'High inflation drives safe-haven demand' 
          : 'Moderate inflation has neutral impact'
      },
      {
        label: 'VIX (Fear Index)',
        value: data.vix.toFixed(2),
        impact: data.vix > 20 ? 'bullish' : 'neutral',
        description: 'Market volatility index',
        icon: <AlertTriangle className="h-4 w-4" />,
        insight: data.vix > 25 
          ? 'High fear drives gold demand' 
          : data.vix > 20 
            ? 'Elevated uncertainty supports gold' 
            : 'Low volatility reduces safe-haven appeal'
      },
      {
        label: 'Gold/Silver Ratio',
        value: data.goldSilverRatio.toFixed(1),
        impact: data.goldSilverRatio > 80 ? 'neutral' : 'bullish',
        description: 'Historical average ~60',
        icon: <Scale className="h-4 w-4" />,
        insight: data.goldSilverRatio > 80 
          ? 'Elevated ratio may indicate overvaluation' 
          : 'Normal ratio suggests fair value'
      }
    ];

    const impactStyles = {
      bullish: 'bg-gain/10 text-gain border-gain/30',
      bearish: 'bg-loss/10 text-loss border-loss/30',
      neutral: 'bg-muted text-muted-foreground border-border'
    };

    const impactBadge = {
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral'
    };

    return (
      <Card ref={ref}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Fundamental Factors
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <Badge className={fundamentalScore >= 60 ? 'bg-gain' : fundamentalScore >= 40 ? 'bg-muted' : 'bg-loss'}>
                {fundamentalScore}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {indicators.map((indicator, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg border transition-colors ${impactStyles[indicator.impact]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <div className="p-1.5 rounded bg-background/50 mt-0.5">
                    {indicator.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{indicator.label}</p>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {impactBadge[indicator.impact]}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{indicator.insight}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-semibold">{indicator.value}</p>
                  {indicator.change !== undefined && (
                    <div className="flex items-center justify-end gap-1 text-xs mt-0.5">
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

          {/* Summary */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                fundamentalScore >= 60 ? 'bg-gain' : 
                fundamentalScore >= 40 ? 'bg-yellow-500' : 'bg-loss'
              }`} />
              <p className="text-sm font-medium">
                {fundamentalScore >= 60 ? 'Bullish Fundamental Backdrop' : 
                 fundamentalScore >= 40 ? 'Mixed Fundamental Signals' : 
                 'Bearish Fundamental Conditions'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {fundamentalScore >= 60 
                ? 'Current macro conditions favor gold prices. Weak USD and elevated uncertainty create a supportive environment.'
                : fundamentalScore >= 40
                  ? 'Mixed signals from macro factors. Watch for changes in USD strength and inflation expectations.'
                  : 'Headwinds from strong USD and high real yields. Gold faces challenges in current environment.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);
