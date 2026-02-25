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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { goldPrice, silverPrice } = await req.json();

    const systemPrompt = `You are a gold market news analyst. Generate 8 realistic, current gold & precious metals market news items based on the current XAU/USD price of $${goldPrice || 'unknown'} and XAG/USD at $${silverPrice || 'unknown'}.

Each news item must reflect real market dynamics and be plausible for today's date. Include a mix of:
- Macro/Fed policy news
- Geopolitical events affecting gold
- Supply/demand dynamics
- Market sentiment shifts
- Central bank activity

Return ONLY valid JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate 8 gold market news items as a JSON array. Each item should have: id (string), title (string, max 80 chars), summary (string, 1-2 sentences), source (string - use real financial sources like Reuters, Bloomberg, CNBC, etc), sentiment ("Bullish" | "Bearish" | "Neutral"), impact ("High" | "Medium" | "Low"), category ("Market" | "Geopolitical" | "Macro" | "Demand"), hoursAgo (number, 1-72).`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_news",
              description: "Return gold market news items",
              parameters: {
                type: "object",
                properties: {
                  news: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        summary: { type: "string" },
                        source: { type: "string" },
                        sentiment: { type: "string", enum: ["Bullish", "Bearish", "Neutral"] },
                        impact: { type: "string", enum: ["High", "Medium", "Low"] },
                        category: { type: "string", enum: ["Market", "Geopolitical", "Macro", "Demand"] },
                        hoursAgo: { type: "number" }
                      },
                      required: ["id", "title", "summary", "source", "sentiment", "impact", "category", "hoursAgo"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["news"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_news" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call response from AI");
    }

    const newsData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, news: newsData.news }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gold news error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});