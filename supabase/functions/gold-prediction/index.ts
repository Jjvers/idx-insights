import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PredictionRequest {
  instrument: string;
  currentPrice: number;
  technicalData: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    sma20: number;
    sma50: number;
    sma200: number;
    bollingerBands: { upper: number; middle: number; lower: number };
    adx: number;
  };
  fundamentalData: {
    usdIndex: number;
    usdIndexChange: number;
    fedFundsRate: number;
    realYield: number;
    inflation: number;
    vix: number;
  };
  recentPrices: number[];
  timeframe: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { 
      instrument, 
      currentPrice, 
      technicalData, 
      fundamentalData, 
      recentPrices,
      timeframe 
    }: PredictionRequest = await req.json();

    const systemPrompt = `You are an expert gold market analyst with deep knowledge of technical analysis, fundamental analysis, and market psychology. Your task is to analyze gold price data and provide a prediction.

IMPORTANT: You must respond ONLY with a valid JSON object. No markdown, no explanations, no code blocks. Just pure JSON.

The JSON must have this exact structure:
{
  "predictedPrice": <number>,
  "predictedChange": <number>,
  "predictedChangePercent": <number>,
  "confidence": <number 0-100>,
  "signal": "<Strong Buy|Buy|Neutral|Sell|Strong Sell>",
  "trend": "<Bullish|Bearish|Sideways>",
  "technicalScore": <number 0-100>,
  "fundamentalScore": <number 0-100>,
  "sentimentScore": <number 0-100>,
  "reasoning": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "riskReward": <number>
}`;

    const userPrompt = `Analyze this gold market data for ${instrument} and predict the ${timeframe} price movement:

CURRENT PRICE: $${currentPrice.toFixed(2)}

TECHNICAL INDICATORS:
- RSI (14): ${technicalData.rsi.toFixed(2)} ${technicalData.rsi > 70 ? '(Overbought)' : technicalData.rsi < 30 ? '(Oversold)' : '(Neutral)'}
- MACD: ${technicalData.macd.macd.toFixed(4)} | Signal: ${technicalData.macd.signal.toFixed(4)} | Histogram: ${technicalData.macd.histogram.toFixed(4)}
- SMA 20: $${technicalData.sma20.toFixed(2)} (Price ${currentPrice > technicalData.sma20 ? 'above' : 'below'})
- SMA 50: $${technicalData.sma50.toFixed(2)} (Price ${currentPrice > technicalData.sma50 ? 'above' : 'below'})
- SMA 200: $${technicalData.sma200.toFixed(2)} (Price ${currentPrice > technicalData.sma200 ? 'above' : 'below'})
- Bollinger Bands: Upper $${technicalData.bollingerBands.upper.toFixed(2)} | Middle $${technicalData.bollingerBands.middle.toFixed(2)} | Lower $${technicalData.bollingerBands.lower.toFixed(2)}
- ADX: ${technicalData.adx.toFixed(2)} (Trend strength: ${technicalData.adx > 25 ? 'Strong' : 'Weak'})

FUNDAMENTAL FACTORS:
- USD Index (DXY): ${fundamentalData.usdIndex} (Change: ${fundamentalData.usdIndexChange > 0 ? '+' : ''}${fundamentalData.usdIndexChange}%) - ${fundamentalData.usdIndexChange > 0 ? 'Bearish for gold' : 'Bullish for gold'}
- Fed Funds Rate: ${fundamentalData.fedFundsRate}%
- Real Yield (10Y-CPI): ${fundamentalData.realYield}%
- Inflation (CPI): ${fundamentalData.inflation}%
- VIX (Fear Index): ${fundamentalData.vix} - ${fundamentalData.vix > 20 ? 'High fear (bullish gold)' : 'Low fear'}

RECENT PRICE ACTION (last 10 days):
${recentPrices.slice(-10).map((p, i) => `Day ${i + 1}: $${p.toFixed(2)}`).join('\n')}

Based on this comprehensive analysis, provide your ${timeframe} prediction for ${instrument}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let prediction;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      prediction = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback prediction based on technical analysis
      prediction = {
        predictedPrice: currentPrice * (technicalData.rsi < 50 ? 1.015 : 0.985),
        predictedChange: currentPrice * (technicalData.rsi < 50 ? 0.015 : -0.015),
        predictedChangePercent: technicalData.rsi < 50 ? 1.5 : -1.5,
        confidence: 60,
        signal: technicalData.rsi < 30 ? "Buy" : technicalData.rsi > 70 ? "Sell" : "Neutral",
        trend: technicalData.macd.histogram > 0 ? "Bullish" : "Bearish",
        technicalScore: 50 + (50 - technicalData.rsi) * 0.5,
        fundamentalScore: fundamentalData.usdIndexChange < 0 ? 65 : 45,
        sentimentScore: fundamentalData.vix > 20 ? 60 : 50,
        reasoning: [
          `RSI at ${technicalData.rsi.toFixed(1)} indicates ${technicalData.rsi < 30 ? 'oversold' : technicalData.rsi > 70 ? 'overbought' : 'neutral'} conditions`,
          `MACD histogram is ${technicalData.macd.histogram > 0 ? 'positive (bullish)' : 'negative (bearish)'}`,
          `USD Index ${fundamentalData.usdIndexChange < 0 ? 'weakening' : 'strengthening'} - ${fundamentalData.usdIndexChange < 0 ? 'bullish' : 'bearish'} for gold`
        ],
        riskReward: 1.5
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      prediction: {
        ...prediction,
        instrument,
        currentPrice,
        timeframe,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Prediction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
