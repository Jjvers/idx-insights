import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockNews, geopoliticalNews, type GoldNews, type NewsCategory } from '@/data/mockGoldData';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, TrendingUp, TrendingDown, Minus, Globe, Shield, BarChart3, Users } from 'lucide-react';

const sentimentStyles = {
  Bullish: { icon: TrendingUp, color: 'text-gain', bg: 'bg-gain/10 border-gain/30' },
  Bearish: { icon: TrendingDown, color: 'text-loss', bg: 'bg-loss/10 border-loss/30' },
  Neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

const categoryIcons: Record<string, React.ElementType> = {
  Market: BarChart3,
  Geopolitical: Globe,
  Macro: Shield,
  Demand: Users,
};

type FilterCategory = 'All' | NewsCategory | 'Geopolitical';

function NewsCard({ news }: { news: GoldNews }) {
  const style = sentimentStyles[news.sentiment];
  const SentimentIcon = style.icon;
  const CategoryIcon = categoryIcons[news.category || 'Market'] || Newspaper;

  return (
    <div className={`p-3 rounded-lg border transition-colors hover:border-accent/40 ${style.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="outline" className="text-[10px] h-5">
            {news.source}
          </Badge>
          {news.category && (
            <Badge variant="outline" className="text-[10px] h-5 bg-accent/10 text-accent border-accent/30">
              {news.category}
            </Badge>
          )}
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
  const [filter, setFilter] = useState<FilterCategory>('All');

  const allNews = [...mockNews, ...geopoliticalNews].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  const filteredNews = filter === 'All'
    ? allNews
    : allNews.filter(n => n.category === filter);

  const bullishCount = allNews.filter(n => n.sentiment === 'Bullish').length;
  const bearishCount = allNews.filter(n => n.sentiment === 'Bearish').length;
  const total = allNews.length;
  const sentimentScore = total > 0 ? Math.round((bullishCount / total) * 100) : 50;
  const geoCount = allNews.filter(n => n.category === 'Geopolitical').length;

  const filters: { value: FilterCategory; label: string; icon?: React.ElementType }[] = [
    { value: 'All', label: 'All' },
    { value: 'Geopolitical', label: `Geopolitics (${geoCount})`, icon: Globe },
    { value: 'Macro', label: 'Macro', icon: Shield },
    { value: 'Demand', label: 'Demand', icon: Users },
    { value: 'Market', label: 'Market', icon: BarChart3 },
  ];

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

        {/* Category Filters */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1"
              onClick={() => setFilter(f.value)}
            >
              {f.icon && <f.icon className="h-3 w-3" />}
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredNews.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
          {filteredNews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No news in this category</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
