import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockNews, type GoldNews } from '@/data/mockGoldData';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, TrendingUp, TrendingDown, Minus, Globe, ExternalLink } from 'lucide-react';

const sentimentStyles = {
  Bullish: { icon: TrendingUp, color: 'text-gain', bg: 'bg-gain/10 border-gain/30' },
  Bearish: { icon: TrendingDown, color: 'text-loss', bg: 'bg-loss/10 border-loss/30' },
  Neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

function NewsCard({ news }: { news: GoldNews }) {
  const style = sentimentStyles[news.sentiment];
  const SentimentIcon = style.icon;

  return (
    <div className={`p-3 rounded-lg border transition-colors hover:border-accent/40 ${style.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-5">
            {news.source}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(news.publishedAt, { addSuffix: true })}
          </span>
        </div>
        <div className={`flex items-center gap-1 ${style.color}`}>
          <SentimentIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium">{news.sentiment}</span>
        </div>
      </div>
      <h4 className="text-sm font-medium text-foreground leading-snug mb-1">
        {news.title}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {news.summary}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-[10px]">
          Impact: {news.impact}
        </Badge>
      </div>
    </div>
  );
}

export function NewsSentiment() {
  const sortedNews = [...mockNews].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  const bullishCount = sortedNews.filter(n => n.sentiment === 'Bullish').length;
  const bearishCount = sortedNews.filter(n => n.sentiment === 'Bearish').length;
  const total = sortedNews.length;
  const sentimentScore = total > 0 ? Math.round((bullishCount / total) * 100) : 50;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5 text-accent" />
            News & Sentiment
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-gain" />
              <span className="text-muted-foreground">{bullishCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-loss" />
              <span className="text-muted-foreground">{bearishCount}</span>
            </div>
          </div>
        </div>
        {/* Sentiment Gauge */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Bearish</span>
            <span className="font-medium text-foreground">Sentiment: {sentimentScore}%</span>
            <span>Bullish</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            <div className="bg-loss h-full transition-all" style={{ width: `${100 - sentimentScore}%` }} />
            <div className="bg-gain h-full transition-all" style={{ width: `${sentimentScore}%` }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {sortedNews.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
