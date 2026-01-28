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

    const systemPrompt = `You are an expert gold market analyst with 20+ years of experience in precious metals trading. You have deep knowledge of technical analysis, fundamental macro analysis, and market psychology. Your task is to analyze gold price data and provide an accurate, well-reasoned prediction.

CRITICAL RULES:
1. You MUST respond ONLY with a valid JSON object. No markdown, no explanations, no code blocks.
2. Base your prediction on the actual data provided - do not invent patterns that don't exist.
3. Be conservative with confidence scores - high confidence (>80%) requires multiple confirming indicators.
4. Provide specific, actionable reasoning based on the data.
5. Calculate key support/resistance levels from the price data.

ANALYSIS FRAMEWORK:
- Technical: Weight RSI, MACD, moving averages, and price position relative to Bollinger Bands
- Fundamental: USD strength, real yields, and inflation expectations are primary drivers
- Sentiment: VIX levels and recent price momentum indicate market psychology

The JSON must have this exact structure:
{
  "predictedPrice": <number - realistic target based on ATR and timeframe>,
  "predictedChange": <number - difference from current price>,
  "predictedChangePercent": <number - percentage change>,
  "confidence": <number 0-100 - be conservative, rarely above 75>,
  "signal": "<Strong Buy|Buy|Neutral|Sell|Strong Sell>",
  "trend": "<Bullish|Bearish|Sideways>",
  "technicalScore": <number 0-100>,
  "fundamentalScore": <number 0-100>,
  "sentimentScore": <number 0-100>,
  "reasoning": ["<specific reason 1 citing data>", "<specific reason 2 citing data>", "<specific reason 3 citing data>"],
  "riskReward": <number - calculate based on target vs stop distance>,
  "keyLevels": {
    "support": [<S1 number>, <S2 number>, <S3 number>],
    "resistance": [<R1 number>, <R2 number>, <R3 number>]
  }
}`;

    // Calculate key price levels from recent data
    const sortedPrices = [...recentPrices].sort((a, b) => a - b);
    const priceMin = sortedPrices[0];
    const priceMax = sortedPrices[sortedPrices.length - 1];
    const priceRange = priceMax - priceMin;
    const pivot = (priceMax + priceMin + currentPrice) / 3;
    
    // Fibonacci levels
    const fib236 = priceMax - (priceRange * 0.236);
    const fib382 = priceMax - (priceRange * 0.382);
    const fib618 = priceMax - (priceRange * 0.618);

    const userPrompt = `Analyze this gold market data for ${instrument} and predict the ${timeframe} price movement:

CURRENT PRICE: $${currentPrice.toFixed(2)}
TIMEFRAME: ${timeframe} (${timeframe === '1D' ? 'next trading day' : timeframe === '1W' ? 'next week' : timeframe === '1M' ? 'next month' : 'next 3 months'})

TECHNICAL INDICATORS:
- RSI (14): ${technicalData.rsi.toFixed(2)} ${technicalData.rsi > 70 ? '⚠️ OVERBOUGHT' : technicalData.rsi < 30 ? '⚠️ OVERSOLD' : '(Neutral zone)'}
- MACD Line: ${technicalData.macd.macd.toFixed(4)}
- MACD Signal: ${technicalData.macd.signal.toFixed(4)}  
- MACD Histogram: ${technicalData.macd.histogram.toFixed(4)} ${technicalData.macd.histogram > 0 ? '(Bullish momentum)' : '(Bearish momentum)'}
- SMA 20: $${technicalData.sma20.toFixed(2)} (Price is ${((currentPrice - technicalData.sma20) / technicalData.sma20 * 100).toFixed(2)}% ${currentPrice > technicalData.sma20 ? 'above' : 'below'})
- SMA 50: $${technicalData.sma50.toFixed(2)} (Price is ${((currentPrice - technicalData.sma50) / technicalData.sma50 * 100).toFixed(2)}% ${currentPrice > technicalData.sma50 ? 'above' : 'below'})
- SMA 200: $${technicalData.sma200.toFixed(2)} (Price is ${((currentPrice - technicalData.sma200) / technicalData.sma200 * 100).toFixed(2)}% ${currentPrice > technicalData.sma200 ? 'above' : 'below'})
- Bollinger Bands: Upper $${technicalData.bollingerBands.upper.toFixed(2)} | Middle $${technicalData.bollingerBands.middle.toFixed(2)} | Lower $${technicalData.bollingerBands.lower.toFixed(2)}
- ADX: ${technicalData.adx.toFixed(2)} ${technicalData.adx > 40 ? '(Very strong trend)' : technicalData.adx > 25 ? '(Strong trend)' : technicalData.adx > 20 ? '(Developing trend)' : '(Weak/No trend)'}

PRICE STRUCTURE:
- 30-Day High: $${priceMax.toFixed(2)}
- 30-Day Low: $${priceMin.toFixed(2)}
- Pivot Point: $${pivot.toFixed(2)}
- Fibonacci 23.6%: $${fib236.toFixed(2)}
- Fibonacci 38.2%: $${fib382.toFixed(2)}
- Fibonacci 61.8%: $${fib618.toFixed(2)}

FUNDAMENTAL FACTORS:
- USD Index (DXY): ${fundamentalData.usdIndex} (${fundamentalData.usdIndexChange > 0 ? '+' : ''}${fundamentalData.usdIndexChange}% change) → ${fundamentalData.usdIndexChange > 0 ? 'BEARISH for gold (stronger USD)' : 'BULLISH for gold (weaker USD)'}
- Fed Funds Rate: ${fundamentalData.fedFundsRate}% → ${fundamentalData.fedFundsRate > 4.5 ? 'BEARISH (high rates)' : 'NEUTRAL'}
- Real Yield (10Y - CPI): ${fundamentalData.realYield}% → ${fundamentalData.realYield < 0 ? 'BULLISH (negative real yield)' : fundamentalData.realYield > 2 ? 'BEARISH (high real yield)' : 'NEUTRAL'}
- Inflation (CPI): ${fundamentalData.inflation}% → ${fundamentalData.inflation > 3.5 ? 'BULLISH (high inflation)' : 'NEUTRAL'}
- VIX (Fear Index): ${fundamentalData.vix} → ${fundamentalData.vix > 25 ? 'BULLISH (high fear)' : fundamentalData.vix > 18 ? 'SLIGHTLY BULLISH' : 'NEUTRAL (low fear)'}

RECENT PRICE TREND (last 10 days closing prices):
${recentPrices.slice(-10).map((p, i) => `Day ${i + 1}: $${p.toFixed(2)}`).join(' → ')}

Momentum: ${recentPrices[recentPrices.length - 1] > recentPrices[recentPrices.length - 5] ? 'SHORT-TERM UPTREND' : 'SHORT-TERM DOWNTREND'}

IMPORTANT: 
1. Use the Fibonacci levels and Bollinger Bands to determine realistic support/resistance levels
2. For ${timeframe} timeframe, expected move should be proportional (${timeframe === '1D' ? '0.3-1%' : timeframe === '1W' ? '1-3%' : timeframe === '1M' ? '2-5%' : '5-10%'} typical)
3. Cite specific indicator values in your reasoning

Provide your ${timeframe} prediction for ${instrument}.`;

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
