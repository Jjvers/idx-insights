import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { expertAnalyses } from '@/data/mockGoldData';
import type { ExpertAnalysis, Signal, GoldInstrument } from '@/types/gold';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Target, Shield, User } from 'lucide-react';

interface ExpertAnalysisListProps {
  instrument?: GoldInstrument;
}

const signalColors: Record<Signal, string> = {
  'Strong Buy': 'bg-gain text-gain-foreground',
  'Buy': 'bg-gain/80 text-gain-foreground',
  'Neutral': 'bg-muted text-muted-foreground',
  'Sell': 'bg-loss/80 text-loss-foreground',
  'Strong Sell': 'bg-loss text-loss-foreground'
};

const formatPrice = (price: number, _instrument: GoldInstrument): string => {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function ExpertCard({ expert }: { expert: ExpertAnalysis }) {
  const isPositive = expert.signal.includes('Buy');

  return (
    <div className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={expert.avatarUrl} alt={expert.expertName} />
          <AvatarFallback className="bg-accent/20 text-accent">
            {expert.expertName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{expert.expertName}</p>
              <p className="text-xs text-muted-foreground">{expert.expertTitle}</p>
            </div>
            <Badge className={signalColors[expert.signal]}>
              {expert.signal}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {expert.analysis}
      </p>

      <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-sm">
          <Target className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Target:</span>
          <span className="font-mono text-foreground">{formatPrice(expert.targetPrice, expert.instrument)}</span>
        </div>
        {expert.stopLoss && (
          <div className="flex items-center gap-1.5 text-sm">
            <Shield className="h-4 w-4 text-loss" />
            <span className="text-muted-foreground">Stop:</span>
            <span className="font-mono text-foreground">{formatPrice(expert.stopLoss, expert.instrument)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Accuracy:</span>
          <span className={`font-mono ${expert.accuracy >= 70 ? 'text-gain' : 'text-foreground'}`}>
            {expert.accuracy}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
        <Badge variant="outline">{expert.instrument}</Badge>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(expert.publishedAt, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export function ExpertAnalysisList({ instrument }: ExpertAnalysisListProps) {
  const filteredExperts = instrument 
    ? expertAnalyses.filter(e => e.instrument === instrument)
    : expertAnalyses;

  const sortedExperts = [...filteredExperts].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Expert Analysis
          </CardTitle>
          <Badge variant="outline">{sortedExperts.length} analysts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {sortedExperts.map(expert => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>

        {sortedExperts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No expert analysis available for this instrument.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
