import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GoldPrediction, GoldInstrument, Timeframe } from '@/types/gold';
import { useGoldPrediction } from '@/hooks/useGoldPrediction';
import { 
  TrendingUp, TrendingDown, Minus, Brain, 
  Target, AlertTriangle, CheckCircle2, Loader2, RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PredictionPanelProps {
  instrument: GoldInstrument;
  timeframe: Timeframe;
}

const signalStyles = {
  'Strong Buy': { bg: 'bg-gain', text: 'text-gain-foreground', icon: TrendingUp },
  'Buy': { bg: 'bg-gain/80', text: 'text-gain-foreground', icon: TrendingUp },
  'Neutral': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Minus },
  'Sell': { bg: 'bg-loss/80', text: 'text-loss-foreground', icon: TrendingDown },
  'Strong Sell': { bg: 'bg-loss', text: 'text-loss-foreground', icon: TrendingDown }
};

const formatPrice = (price: number, instrument: GoldInstrument): string => {
  if (instrument === 'ANTAM') {
    return `Rp ${price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function PredictionPanel({ instrument, timeframe }: PredictionPanelProps) {
  const { prediction, isLoading, error, generatePrediction } = useGoldPrediction(instrument, timeframe);

  if (!prediction && !isLoading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Prediction Engine</h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
            Get AI-powered price predictions based on technical indicators, fundamental factors, 
            and market sentiment analysis.
          </p>
          <Button onClick={generatePrediction} size="lg" className="gap-2">
            <Brain className="h-4 w-4" />
            Generate {timeframe} Prediction
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Market Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Prediction Failed</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={generatePrediction} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  const SignalIcon = signalStyles[prediction.signal].icon;
  const isPositive = prediction.predictedChange >= 0;

  return (
    <Card className="col-span-full border-accent/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Prediction - {timeframe}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Generated {formatDistanceToNow(prediction.generatedAt, { addSuffix: true })}
            </span>
            <Button variant="ghost" size="sm" onClick={generatePrediction} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Prediction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Signal */}
          <div className={`p-4 rounded-lg ${signalStyles[prediction.signal].bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <SignalIcon className={`h-6 w-6 ${signalStyles[prediction.signal].text}`} />
              <span className={`text-lg font-bold ${signalStyles[prediction.signal].text}`}>
                {prediction.signal}
              </span>
            </div>
            <p className="text-sm opacity-80">
              Trend: {prediction.trend}
            </p>
            <p className="text-sm opacity-80">
              Confidence: {prediction.confidence}%
            </p>
          </div>

          {/* Price Target */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Price Target</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {formatPrice(prediction.predictedPrice, instrument)}
            </p>
            <p className={`text-sm font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? '+' : ''}{formatPrice(prediction.predictedChange, instrument)} 
              ({isPositive ? '+' : ''}{prediction.predictedChangePercent.toFixed(2)}%)
            </p>
          </div>

          {/* Risk/Reward */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Risk/Reward</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              1:{prediction.riskReward.toFixed(1)}
            </p>
            <Badge variant={prediction.riskReward >= 2 ? 'default' : 'secondary'}>
              {prediction.riskReward >= 2 ? 'Favorable' : 'Moderate'}
            </Badge>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ScoreBar label="Technical" score={prediction.technicalScore} />
          <ScoreBar label="Fundamental" score={prediction.fundamentalScore} />
          <ScoreBar label="Sentiment" score={prediction.sentimentScore} />
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Analysis Summary</p>
          <div className="space-y-2">
            {prediction.reasoning.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Levels */}
        {prediction.keyLevels && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Support Levels</p>
              <div className="space-y-1">
                {prediction.keyLevels.support.map((level, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gain" />
                    <span className="font-mono text-sm">{formatPrice(level, instrument)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resistance Levels</p>
              <div className="space-y-1">
                {prediction.keyLevels.resistance.map((level, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-loss" />
                    <span className="font-mono text-sm">{formatPrice(level, instrument)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'bg-gain';
    if (s >= 50) return 'bg-accent';
    if (s >= 30) return 'bg-yellow-500';
    return 'bg-loss';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${getScoreColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
