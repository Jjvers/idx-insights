import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AINewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impact: 'High' | 'Medium' | 'Low';
  category: 'Market' | 'Geopolitical' | 'Macro' | 'Demand';
  hoursAgo: number;
}

export function useGoldNews() {
  const [news, setNews] = useState<AINewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNews = useCallback(async (goldPrice?: number, silverPrice?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gold-news', {
        body: { goldPrice, silverPrice },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error);

      setNews(data.news);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(message);
      console.error('Gold news fetch error:', message);
      toast({
        title: 'News Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { news, isLoading, error, fetchNews };
}