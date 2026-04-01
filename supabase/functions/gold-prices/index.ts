import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOLDAPI_API_KEY = Deno.env.get("GOLDAPI_API_KEY");
    if (!GOLDAPI_API_KEY) {
      throw new Error("GOLDAPI_API_KEY is not configured");
    }

    const { type } = await req.json();

    if (type === "latest") {
      // Fetch XAU/USD and XAG/USD in parallel from GoldAPI.io
      const [xauRes, xagRes] = await Promise.all([
        fetch("https://www.goldapi.io/api/XAU/USD", {
          headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
        }),
        fetch("https://www.goldapi.io/api/XAG/USD", {
          headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
        }),
      ]);

      if (!xauRes.ok) {
        const errorText = await xauRes.text();
        console.error("GoldAPI XAU error:", xauRes.status, errorText);
        throw new Error(`GoldAPI XAU error: ${xauRes.status} - ${errorText}`);
      }
      if (!xagRes.ok) {
        const errorText = await xagRes.text();
        console.error("GoldAPI XAG error:", xagRes.status, errorText);
        throw new Error(`GoldAPI XAG error: ${xagRes.status} - ${errorText}`);
      }

      const xauData = await xauRes.json();
      const xagData = await xagRes.json();

      console.log("GoldAPI XAU response:", JSON.stringify(xauData));
      console.log("GoldAPI XAG response:", JSON.stringify(xagData));

      // GoldAPI returns: price, price_gram_24k, price_gram_22k, price_gram_21k, price_gram_18k,
      // open_price, high_price, low_price, prev_close_price, ch, chp, timestamp
      const goldPrice = xauData.price;
      const silverPrice = xagData.price;

      if (!goldPrice || !silverPrice) {
        throw new Error("Invalid price data from GoldAPI");
      }

      return new Response(JSON.stringify({
        success: true,
        prices: {
          XAU: goldPrice,
          XAG: silverPrice,
          goldSilverRatio: goldPrice / silverPrice,
          // GoldAPI provides OHLC data per instrument
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
    }

    throw new Error("Invalid request type. Use 'latest'.");
  } catch (error) {
    console.error("Gold prices error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
