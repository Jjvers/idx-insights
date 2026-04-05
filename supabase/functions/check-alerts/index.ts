import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callTelegram(message: string, chatId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  if (!TELEGRAM_API_KEY) {
    throw new Error('TELEGRAM_API_KEY is not configured');
  }

  const response = await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TELEGRAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const rawText = await response.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = rawText;
  }

  if (!response.ok || (typeof data === 'object' && data?.ok === false)) {
    const detail = typeof data === 'object' && data
      ? data.description || data.error || JSON.stringify(data)
      : rawText || response.statusText;

    throw new Error(`Telegram API call failed [${response.status}]: ${detail}`);
  }

  return {
    messageId: data?.result?.message_id ?? null,
  };
}

async function fetchMetalPrice(symbol: 'XAU/USD' | 'XAG/USD', apiKey: string) {
  const response = await fetch(`https://www.goldapi.io/api/${symbol}`, {
    headers: { "x-access-token": apiKey, "Content-Type": "application/json" },
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`GoldAPI ${symbol} error [${response.status}]: ${rawText}`);
  }

  const data = JSON.parse(rawText);
  return {
    price: Number(data.price || 0),
    change: Number(data.chp || 0),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOLDAPI_API_KEY = Deno.env.get("GOLDAPI_API_KEY");
    if (!GOLDAPI_API_KEY) {
      throw new Error("GOLDAPI_API_KEY is not configured");
    }

    const [xauResult, xagResult] = await Promise.allSettled([
      fetchMetalPrice('XAU/USD', GOLDAPI_API_KEY),
      fetchMetalPrice('XAG/USD', GOLDAPI_API_KEY),
    ]);

    if (xauResult.status === 'rejected') {
      console.error('Check-alerts XAU fetch error:', xauResult.reason);
    }

    if (xagResult.status === 'rejected') {
      console.error('Check-alerts XAG fetch error:', xagResult.reason);
    }

    if (xauResult.status === 'rejected' && xagResult.status === 'rejected') {
      throw new Error('GoldAPI price fetch failed for XAU and XAG');
    }

    const xauPrice = xauResult.status === 'fulfilled' ? xauResult.value.price : 0;
    const xagPrice = xagResult.status === 'fulfilled' ? xagResult.value.price : 0;
    const xauChange = xauResult.status === 'fulfilled' ? xauResult.value.change : 0;
    const xagChange = xagResult.status === 'fulfilled' ? xagResult.value.change : 0;

    console.log(`Check-alerts: XAU=$${xauPrice} (${xauChange}%), XAG=$${xagPrice} (${xagChange}%)`);

    const significantMove = Math.abs(xauChange) > 1 || Math.abs(xagChange) > 1;

    let alerts: any[] = [];
    let chatId = '';
    try {
      const body = await req.json();
      alerts = body.alerts || [];
      chatId = body.chatId || '';
    } catch {
      // cron calls with empty body, that's fine
    }

    const triggered: any[] = [];
    const notificationErrors: Array<{ alertId?: string; error: string }> = [];

    for (const alert of alerts) {
      const price = alert.instrument === 'XAU/USD' ? xauPrice : xagPrice;
      if (!price) continue;

      const shouldTrigger =
        (alert.condition === 'above' && price >= alert.targetPrice) ||
        (alert.condition === 'below' && price <= alert.targetPrice);

      if (shouldTrigger) {
        triggered.push({ ...alert, currentPrice: price });
        
        const targetChatId = alert.telegramChatId || chatId;
        if (targetChatId) {
          const emoji = alert.condition === 'above' ? '📈' : '📉';
          try {
            await callTelegram(
              `${emoji} <b>🔔 Server Alert Triggered!</b>\n\n` +
              `📊 ${alert.instrument}\n` +
              `💰 Current: $${price.toFixed(2)}\n` +
              `🎯 Target: $${alert.targetPrice.toFixed(2)} (${alert.condition})\n` +
              `${alert.message ? `\n📝 ${alert.message}` : ''}\n\n` +
              `<i>⏰ Auto-checked by server cron job</i>`,
              targetChatId
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Telegram error';
            console.error('Check-alerts custom notification error:', message);
            notificationErrors.push({ alertId: alert.id, error: message });
          }
        }
      }
    }

    if (significantMove && chatId) {
      const moves: string[] = [];
      if (Math.abs(xauChange) > 1) {
        const emoji = xauChange > 0 ? '🟢📈' : '🔴📉';
        moves.push(`${emoji} XAU/USD: $${xauPrice.toFixed(2)} (${xauChange > 0 ? '+' : ''}${xauChange.toFixed(2)}%)`);
      }
      if (Math.abs(xagChange) > 1) {
        const emoji = xagChange > 0 ? '🟢📈' : '🔴📉';
        moves.push(`${emoji} XAG/USD: $${xagPrice.toFixed(2)} (${xagChange > 0 ? '+' : ''}${xagChange.toFixed(2)}%)`);
      }
      
      try {
        await callTelegram(
          `⚡ <b>Significant Price Movement!</b>\n\n${moves.join('\n')}\n\n<i>⏰ Auto-detected by server monitoring</i>`,
          chatId
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown Telegram error';
        console.error('Check-alerts significant move notification error:', message);
        notificationErrors.push({ error: message });
      }
    }

    return jsonResponse({
      success: notificationErrors.length === 0,
      prices: { XAU: xauPrice, XAG: xagPrice },
      changes: { XAU: xauChange, XAG: xagChange },
      triggered: triggered.length,
      significantMove,
      notificationErrors,
    });

  } catch (error) {
    console.error("Check-alerts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
