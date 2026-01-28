import { useState, useEffect, useCallback } from 'react';
import type { GoldPrediction, GoldInstrument, Timeframe, OHLC } from '@/types/gold';
import { getGoldPrediction } from '@/lib/api/goldPrediction';
import { calculateAllIndicators } from '@/lib/technicalIndicators';
import { getOHLCData, fundamentalIndicators } from '@/data/mockGoldData';
import { useToast } from '@/hooks/use-toast';

export function useGoldPrediction(instrument: GoldInstrument, timeframe: Timeframe) {
  const [prediction, setPrediction] = useState<GoldPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const ohlcData = getOHLCData(instrument);
      const technicalData = calculateAllIndicators(ohlcData);
      const currentPrice = ohlcData[ohlcData.length - 1].close;
      const recentPrices = ohlcData.slice(-30).map(d => d.close);

      const result = await getGoldPrediction({
        instrument,
        currentPrice,
        technicalData,
        fundamentalData: fundamentalIndicators,
        recentPrices,
        timeframe
      });

      setPrediction(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate prediction';
      setError(message);
      toast({
        title: 'Prediction Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [instrument, timeframe, toast]);

  return {
    prediction,
    isLoading,
    error,
    generatePrediction
  };
}
