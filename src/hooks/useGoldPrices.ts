import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveGoldPrices {
  XAU: number;
  XAG: number;
  goldSilverRatio: number;
  // Real OHLC from GoldAPI
  XAU_open: number;
  XAU_high: number;
  XAU_low: number;
  XAU_prev_close: number;
  XAU_change: number;
  XAU_changePercent: number;
  XAG_open: number;
  XAG_high: number;
  XAG_low: number;
  XAG_prev_close: number;
  XAG_change: number;
  XAG_changePercent: number;
  timestamp: number;
  date: string;
}

export function useGoldPrices(refreshInterval = 300000) {
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
        goldSilverRatio: data.prices.goldSilverRatio,
        XAU_open: data.prices.XAU_open,
        XAU_high: data.prices.XAU_high,
        XAU_low: data.prices.XAU_low,
        XAU_prev_close: data.prices.XAU_prev_close,
        XAU_change: data.prices.XAU_change,
        XAU_changePercent: data.prices.XAU_changePercent,
        XAG_open: data.prices.XAG_open,
        XAG_high: data.prices.XAG_high,
        XAG_low: data.prices.XAG_low,
        XAG_prev_close: data.prices.XAG_prev_close,
        XAG_change: data.prices.XAG_change,
        XAG_changePercent: data.prices.XAG_changePercent,
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
