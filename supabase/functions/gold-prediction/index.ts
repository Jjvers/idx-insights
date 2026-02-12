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

    const systemPrompt = `You are an expert gold market analyst with 20+ years of experience. Analyze gold data and provide a comprehensive prediction with SCENARIOS and per-indicator REASONING.

CRITICAL RULES:
1. You MUST respond ONLY with a valid JSON object. No markdown, no code blocks.
2. Base predictions on actual data - be conservative with confidence (rarely >75%).
3. Provide TWO scenarios (bullish & bearish) with probabilities that sum to ~100%.
4. For EACH indicator, explain WHY it matters and what it tells us.
5. Check for price gaps between sessions and explain significance.

The JSON must have this EXACT structure:
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
  "reasoning": ["<reason1>", "<reason2>", "<reason3>", "<reason4>"],
  "indicatorReasoning": {
    "rsi": "<WHY RSI at this level matters, what it signals, and historical context>",
    "macd": "<WHY MACD crossover/divergence matters, momentum direction>",
    "movingAverages": "<WHY price position relative to SMA/EMA matters, golden/death cross>",
    "fibonacci": "<WHY these fib levels matter, where price sits in the retracement>",
    "bollinger": "<WHY BB width/position matters, squeeze or expansion>",
    "fundamental": "<WHY macro factors (USD, rates, inflation) are driving gold>"
  },
  "scenarios": [
    {
      "name": "<e.g. Bullish Breakout / Accumulation Phase>",
      "probability": <number 0-100>,
      "priceTarget": <number>,
      "description": "<What happens in this scenario and WHY>",
      "triggers": ["<trigger1>", "<trigger2>"],
      "riskLevel": "<Low|Medium|High>"
    },
    {
      "name": "<e.g. Distribution / Bearish Rejection>",
      "probability": <number 0-100>,
      "priceTarget": <number>,
      "description": "<What happens in this scenario and WHY>",
      "triggers": ["<trigger1>", "<trigger2>"],
      "riskLevel": "<Low|Medium|High>"
    }
  ],
  "gapAnalysis": {
    "hasGap": <boolean>,
    "gapType": "<Up|Down|None>",
    "gapSize": <number>,
    "gapPercent": <number>,
    "filled": <boolean>,
    "reasoning": "<WHY this gap matters - gaps tend to fill, institutional activity>"
  },
  "riskReward": <number>,
  "keyLevels": {
    "support": [<S1>, <S2>, <S3>],
    "resistance": [<R1>, <R2>, <R3>]
  }
}`;

    // Calculate key price levels
    const sortedPrices = [...recentPrices].sort((a, b) => a - b);
    const priceMin = sortedPrices[0];
    const priceMax = sortedPrices[sortedPrices.length - 1];
    const priceRange = priceMax - priceMin;
    const pivot = (priceMax + priceMin + currentPrice) / 3;
    
    const fib236 = priceMax - (priceRange * 0.236);
    const fib382 = priceMax - (priceRange * 0.382);
    const fib618 = priceMax - (priceRange * 0.618);

    // Gap detection
    const lastClose = recentPrices[recentPrices.length - 2];
    const todayOpen = recentPrices[recentPrices.length - 1]; // simplified
    const gapSize = Math.abs(todayOpen - lastClose);
    const gapPercent = (gapSize / lastClose) * 100;
    const hasGap = gapPercent > 0.15;

    const userPrompt = `Analyze this gold market data for ${instrument} and predict the ${timeframe} price movement:

CURRENT PRICE: $${currentPrice.toFixed(2)}
TIMEFRAME: ${timeframe} (${timeframe === '1D' ? 'next trading day' : timeframe === '1W' ? 'next week' : timeframe === '1M' ? 'next month' : 'next 3 months'})

TECHNICAL INDICATORS:
- RSI (14): ${technicalData.rsi.toFixed(2)} ${technicalData.rsi > 70 ? '⚠️ OVERBOUGHT' : technicalData.rsi < 30 ? '⚠️ OVERSOLD' : '(Neutral zone)'}
- MACD Line: ${technicalData.macd.macd.toFixed(4)}
- MACD Signal: ${technicalData.macd.signal.toFixed(4)}  
- MACD Histogram: ${technicalData.macd.histogram.toFixed(4)} ${technicalData.macd.histogram > 0 ? '(Bullish momentum)' : '(Bearish momentum)'}
- SMA 20: $${technicalData.sma20.toFixed(2)} (Price ${((currentPrice - technicalData.sma20) / technicalData.sma20 * 100).toFixed(2)}% ${currentPrice > technicalData.sma20 ? 'above' : 'below'})
- SMA 50: $${technicalData.sma50.toFixed(2)} (Price ${((currentPrice - technicalData.sma50) / technicalData.sma50 * 100).toFixed(2)}% ${currentPrice > technicalData.sma50 ? 'above' : 'below'})
- SMA 200: $${technicalData.sma200.toFixed(2)} (Price ${((currentPrice - technicalData.sma200) / technicalData.sma200 * 100).toFixed(2)}% ${currentPrice > technicalData.sma200 ? 'above' : 'below'})
- Bollinger: Upper $${technicalData.bollingerBands.upper.toFixed(2)} | Mid $${technicalData.bollingerBands.middle.toFixed(2)} | Lower $${technicalData.bollingerBands.lower.toFixed(2)}
- ADX: ${technicalData.adx.toFixed(2)} ${technicalData.adx > 40 ? '(Very strong trend)' : technicalData.adx > 25 ? '(Strong trend)' : '(Weak trend)'}

PRICE STRUCTURE:
- 30D High: $${priceMax.toFixed(2)} | Low: $${priceMin.toFixed(2)}
- Pivot: $${pivot.toFixed(2)}
- Fib 23.6%: $${fib236.toFixed(2)} | 38.2%: $${fib382.toFixed(2)} | 61.8%: $${fib618.toFixed(2)}

GAP DETECTION:
- Previous Close: $${lastClose.toFixed(2)}
- Today Open: $${todayOpen.toFixed(2)}
- Gap: ${hasGap ? `${todayOpen > lastClose ? 'UP' : 'DOWN'} gap of $${gapSize.toFixed(2)} (${gapPercent.toFixed(3)}%)` : 'No significant gap'}
- Note: Gaps are important because they often get filled (price returns to close the gap). Institutional traders use gaps for entry/exit.

FUNDAMENTAL FACTORS:
- DXY: ${fundamentalData.usdIndex} (${fundamentalData.usdIndexChange > 0 ? '+' : ''}${fundamentalData.usdIndexChange}%) → ${fundamentalData.usdIndexChange > 0 ? 'BEARISH for gold' : 'BULLISH for gold'}
- Fed Rate: ${fundamentalData.fedFundsRate}% | Real Yield: ${fundamentalData.realYield}%
- CPI: ${fundamentalData.inflation}% | VIX: ${fundamentalData.vix}

CORRELATED ASSETS CONTEXT:
- Silver (XAG/USD) is a LEADING indicator for gold (moves 1-3 days before gold)
- Copper (Dr. Copper) signals global growth outlook - falling copper = risk-off = gold bullish
- DXY inverse correlation: weaker dollar = stronger gold

RECENT PRICES (last 10 days):
${recentPrices.slice(-10).map((p, i) => `Day ${i + 1}: $${p.toFixed(2)}`).join(' → ')}

IMPORTANT INSTRUCTIONS:
1. Provide TWO distinct scenarios: one bullish, one bearish/distribution
2. For each indicator, explain the REASONING (kenapa indikator ini penting, apa yang ditunjukkan)
3. Check gap between sessions - if gap exists, explain the trading opportunity
4. Expected ${timeframe} move: ${timeframe === '1D' ? '0.3-1%' : timeframe === '1W' ? '1-3%' : timeframe === '1M' ? '2-5%' : '5-10%'}
5. Cite specific numbers in your reasoning`;

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

    let prediction;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      prediction = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
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
          `RSI at ${technicalData.rsi.toFixed(1)} — ${technicalData.rsi < 30 ? 'oversold' : technicalData.rsi > 70 ? 'overbought' : 'neutral'}`,
          `MACD histogram ${technicalData.macd.histogram > 0 ? 'positive (bullish)' : 'negative (bearish)'}`,
          `DXY ${fundamentalData.usdIndexChange < 0 ? 'weakening → bullish gold' : 'strengthening → bearish gold'}`
        ],
        indicatorReasoning: {
          rsi: `RSI at ${technicalData.rsi.toFixed(1)} — measures momentum speed. Above 70 = overbought risk, below 30 = oversold bounce opportunity.`,
          macd: `MACD histogram ${technicalData.macd.histogram > 0 ? 'positive' : 'negative'} — confirms ${technicalData.macd.histogram > 0 ? 'bullish' : 'bearish'} momentum direction.`,
          movingAverages: `Price ${currentPrice > technicalData.sma50 ? 'above' : 'below'} SMA50 — defines medium-term trend direction.`,
          fibonacci: `Price near Fib levels — key retracement zones where institutional orders cluster.`,
          bollinger: `Bollinger Bands — measures volatility. Squeeze = big move incoming.`,
          fundamental: `DXY ${fundamentalData.usdIndexChange < 0 ? 'declining' : 'rising'} — inverse correlation with gold.`
        },
        scenarios: [
          {
            name: "Bullish Continuation",
            probability: technicalData.rsi < 50 ? 60 : 40,
            priceTarget: currentPrice * 1.02,
            description: "Price continues upward supported by technical momentum",
            triggers: ["Break above resistance", "DXY continues to weaken"],
            riskLevel: "Medium"
          },
          {
            name: "Bearish Distribution",
            probability: technicalData.rsi < 50 ? 40 : 60,
            priceTarget: currentPrice * 0.98,
            description: "Smart money distributes positions, price pulls back",
            triggers: ["Fail at resistance", "USD strengthens"],
            riskLevel: "Medium"
          }
        ],
        gapAnalysis: {
          hasGap,
          gapType: hasGap ? (todayOpen > lastClose ? "Up" : "Down") : "None",
          gapSize: hasGap ? gapSize : 0,
          gapPercent: hasGap ? gapPercent : 0,
          filled: false,
          reasoning: hasGap ? "Gap detected — gaps often fill within 1-3 sessions as price returns to close the imbalance." : "No significant gap — normal price action."
        },
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
