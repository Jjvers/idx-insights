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
    const METALPRICE_API_KEY = Deno.env.get("METALPRICE_API_KEY");
    if (!METALPRICE_API_KEY) {
      throw new Error("METALPRICE_API_KEY is not configured");
    }

    const { type, startDate, endDate } = await req.json();

    if (type === "latest") {
      const url = `https://api.metalpriceapi.com/v1/latest?api_key=${METALPRICE_API_KEY}&base=USD&currencies=XAU,XAG`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("MetalpriceAPI error:", response.status, errorText);
        throw new Error(`MetalpriceAPI error: ${response.status}`);
      }

      const data = await response.json();
      console.log("MetalpriceAPI response:", JSON.stringify(data));
      
      if (!data.success) {
        throw new Error(data.error?.info || data.error?.type || "API request failed");
      }

      // The API returns rates in two formats:
      // XAU: 0.000482 (how much XAU per 1 USD)
      // USDXAU: 1856.90 (how much USD per 1 XAU)
      const goldPrice = data.rates?.USDXAU || (data.rates?.XAU ? 1 / data.rates.XAU : null);
      const silverPrice = data.rates?.USDXAG || (data.rates?.XAG ? 1 / data.rates.XAG : null);
      const copperPrice = data.rates?.USDXCU || (data.rates?.XCU ? 1 / data.rates.XCU : null);

      return new Response(JSON.stringify({
        success: true,
        prices: {
          XAU: goldPrice,
          XAG: silverPrice,
          XCU: copperPrice,
          goldSilverRatio: goldPrice / silverPrice,
        },
        timestamp: data.timestamp,
        date: data.date,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "historical") {
      // Calculate dates if not provided
      const end = endDate || new Date().toISOString().split("T")[0];
      const start = startDate || (() => {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        return d.toISOString().split("T")[0];
      })();

      const url = `https://api.metalpriceapi.com/v1/timeframe?api_key=${METALPRICE_API_KEY}&start_date=${start}&end_date=${end}&base=USD&currencies=XAU,XAG`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("MetalpriceAPI historical error:", response.status, errorText);
        throw new Error(`MetalpriceAPI historical error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.info || "Historical API request failed");
      }

      return new Response(JSON.stringify({
        success: true,
        historical: data.rates,
        startDate: data.start_date,
        endDate: data.end_date,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type. Use 'latest' or 'historical'.");
  } catch (error) {
    console.error("Gold prices error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
