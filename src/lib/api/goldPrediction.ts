import { supabase } from '@/integrations/supabase/client';
import type { GoldPrediction, GoldInstrument, Timeframe, TechnicalIndicators, FundamentalIndicators } from '@/types/gold';

interface PredictionRequest {
  instrument: GoldInstrument;
  currentPrice: number;
  technicalData: TechnicalIndicators;
  fundamentalData: FundamentalIndicators;
  recentPrices: number[];
  timeframe: Timeframe;
}

export async function getGoldPrediction(request: PredictionRequest): Promise<GoldPrediction> {
  const { data, error } = await supabase.functions.invoke('gold-prediction', {
    body: request
  });

  if (error) {
    console.error('Prediction error:', error);
    throw new Error(error.message || 'Failed to get prediction');
  }

  if (!data.success) {
    throw new Error(data.error || 'Prediction failed');
  }

  return {
    ...data.prediction,
    generatedAt: new Date(data.prediction.generatedAt)
  };
}
