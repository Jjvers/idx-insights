import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

interface PriceAlert {
  id: string;
  instrument: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  telegramChatId?: string;
  message?: string;
}

interface PriceAlertsRequest {
  action?: 'status' | 'notify' | 'check';
  alert?: Partial<PriceAlert>;
  alerts?: PriceAlert[];
  prices?: Record<string, number>;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callTelegram(method: string, payload: Record<string, unknown> = {}) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  if (!TELEGRAM_API_KEY) {
    throw new Error('TELEGRAM_API_KEY is not configured');
  }

  const response = await fetch(`${TELEGRAM_GATEWAY_URL}/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TELEGRAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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

  return data;
}

async function sendTelegramAlert(message: string, chatId: string) {
  const data = await callTelegram('sendMessage', {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
  });

  return {
    messageId: data?.result?.message_id ?? null,
  };
}

async function getTelegramBotStatus() {
  const data = await callTelegram('getMe');
  return data?.result ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PriceAlertsRequest = await req.json().catch(() => ({}));
    const { action, alert } = body;

    if (action === 'status') {
      const bot = await getTelegramBotStatus();
      return jsonResponse({ success: true, bot });
    }

    if (action === 'check') {
      const alerts = Array.isArray(body.alerts) ? body.alerts : [];
      const prices = body.prices || {};
      const triggered: PriceAlert[] = [];
      const notifications: Array<{ id: string; messageId: number | null }> = [];

      for (const a of alerts) {
        const currentPrice = prices?.[a.instrument] || 0;
        if (
          (a.condition === 'above' && currentPrice >= a.targetPrice) ||
          (a.condition === 'below' && currentPrice <= a.targetPrice)
        ) {
          triggered.push({ ...a, currentPrice });
          
          if (a.telegramChatId) {
            const emoji = a.condition === 'above' ? '📈' : '📉';
            const msg = `${emoji} <b>Price Alert Triggered!</b>\n\n` +
              `📊 ${a.instrument}\n` +
              `💰 Current: $${currentPrice.toFixed(2)}\n` +
              `🎯 Target: $${a.targetPrice.toFixed(2)} (${a.condition})\n` +
              `${a.message ? `\n📝 ${a.message}` : ''}`;
            const result = await sendTelegramAlert(msg, a.telegramChatId);
            notifications.push({ id: a.id, messageId: result.messageId });
          }
        }
      }

      return jsonResponse({ success: true, triggered, notifications });
    }

    if (action === 'notify') {
      const chatId = alert?.telegramChatId?.toString().trim();
      const message = alert?.message?.toString().trim() || 'Gold Price Alert';

      if (!chatId) {
        return jsonResponse({ success: false, error: 'telegramChatId is required' }, 400);
      }

      const result = await sendTelegramAlert(message, chatId);
      return jsonResponse({ success: true, messageId: result.messageId });
    }

    return jsonResponse({ success: false, error: 'Invalid action. Use status, notify, or check.' }, 400);

  } catch (error) {
    console.error("Price alerts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ success: false, error: errorMessage }, 500);
  }
});
