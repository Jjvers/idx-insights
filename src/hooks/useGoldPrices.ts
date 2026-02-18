import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveGoldPrices {
  XAU: number;
  XAG: number;
  XCU: number | null;
  goldSilverRatio: number;
  timestamp: number;
  date: string;
}

export function useGoldPrices(refreshInterval = 300000) { // 5 min default
  const [prices, setPrices] = useState<LiveGoldPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('gold-prices', {
        body: { type: 'latest' },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error);

      setPrices({
        XAU: data.prices.XAU,
        XAG: data.prices.XAG,
        XCU: data.prices.XCU,
        goldSilverRatio: data.prices.goldSilverRatio,
        timestamp: data.timestamp,
        date: data.date,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch gold prices';
      setError(message);
      console.error('Gold price fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, isLoading, error, refetch: fetchPrices };
}
