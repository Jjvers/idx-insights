import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateFallbackPrices() {
  const baseGold = 2650 + (Math.random() - 0.5) * 40;
  const baseSilver = 31.5 + (Math.random() - 0.5) * 1.5;
  const goldChange = (Math.random() - 0.5) * 20;
  const silverChange = (Math.random() - 0.5) * 0.8;
  const goldOpen = baseGold - goldChange;
  const silverOpen = baseSilver - silverChange;

  return {
    success: true,
    source: "simulated",
    prices: {
      XAU: baseGold,
      XAG: baseSilver,
      goldSilverRatio: baseGold / baseSilver,
      XAU_open: goldOpen,
      XAU_high: Math.max(baseGold, goldOpen) + Math.random() * 10,
      XAU_low: Math.min(baseGold, goldOpen) - Math.random() * 10,
      XAU_prev_close: goldOpen,
      XAU_change: goldChange,
      XAU_changePercent: (goldChange / goldOpen) * 100,
      XAG_open: silverOpen,
      XAG_high: Math.max(baseSilver, silverOpen) + Math.random() * 0.5,
      XAG_low: Math.min(baseSilver, silverOpen) - Math.random() * 0.5,
      XAG_prev_close: silverOpen,
      XAG_change: silverChange,
      XAG_changePercent: (silverChange / silverOpen) * 100,
    },
    timestamp: Math.floor(Date.now() / 1000),
    date: new Date().toISOString().split("T")[0],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();

    if (type !== "latest") {
      throw new Error("Invalid request type. Use 'latest'.");
    }

    const GOLDAPI_API_KEY = Deno.env.get("GOLDAPI_API_KEY");
    if (!GOLDAPI_API_KEY) {
      console.warn("GOLDAPI_API_KEY not set, using fallback prices");
      return new Response(JSON.stringify(generateFallbackPrices()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [xauRes, xagRes] = await Promise.all([
      fetch("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
      }),
      fetch("https://www.goldapi.io/api/XAG/USD", {
        headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
      }),
    ]);

    // If quota exceeded or any API error, fall back to simulated data
    if (!xauRes.ok || !xagRes.ok) {
      const errText = !xauRes.ok ? await xauRes.text() : await xagRes.text();
      console.warn("GoldAPI error, using fallback:", xauRes.status, errText);
      // consume remaining body
      if (!xauRes.ok && xagRes.ok) await xagRes.text();
      if (xauRes.ok && !xagRes.ok) await xauRes.text();
      return new Response(JSON.stringify(generateFallbackPrices()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const xauData = await xauRes.json();
    const xagData = await xagRes.json();

    const goldPrice = xauData.price;
    const silverPrice = xagData.price;

    if (!goldPrice || !silverPrice) {
      console.warn("Invalid price data, using fallback");
      return new Response(JSON.stringify(generateFallbackPrices()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      source: "goldapi",
      prices: {
        XAU: goldPrice,
        XAG: silverPrice,
        goldSilverRatio: goldPrice / silverPrice,
        XAU_open: xauData.open_price,
        XAU_high: xauData.high_price,
        XAU_low: xauData.low_price,
        XAU_prev_close: xauData.prev_close_price,
        XAU_change: xauData.ch,
        XAU_changePercent: xauData.chp,
        XAG_open: xagData.open_price,
        XAG_high: xagData.high_price,
        XAG_low: xagData.low_price,
        XAG_prev_close: xagData.prev_close_price,
        XAG_change: xagData.ch,
        XAG_changePercent: xagData.chp,
      },
      timestamp: xauData.timestamp,
      date: new Date(xauData.timestamp * 1000).toISOString().split("T")[0],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gold prices error:", error);
    // Even on unexpected errors, return fallback so UI never breaks
    return new Response(JSON.stringify(generateFallbackPrices()), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});