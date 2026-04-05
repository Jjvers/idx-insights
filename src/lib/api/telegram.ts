import { supabase } from '@/integrations/supabase/client';

export const TELEGRAM_BOT_USERNAME = 'goldaiprediction_bot';

const TELEGRAM_CHAT_ID_PATTERN = /^-?\d+$/;

interface TelegramFunctionResponse {
  success: boolean;
  error?: string;
  messageId?: number | null;
  bot?: {
    id: number;
    username?: string;
    first_name?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  } | null;
}

export function normalizeTelegramChatId(input: string) {
  return input.trim();
}

export function isValidTelegramChatId(input: string) {
  return TELEGRAM_CHAT_ID_PATTERN.test(normalizeTelegramChatId(input));
}

export function getTelegramSetupHint(errorMessage?: string) {
  const normalizedError = (errorMessage || '').toLowerCase();

  if (normalizedError.includes('chat not found')) {
    return 'Chat ID belum valid. Ambil ulang dari @userinfobot lalu pastikan angkanya sama persis.';
  }

  if (normalizedError.includes("bot can't initiate conversation") || normalizedError.includes('forbidden')) {
    return `Klik Start di @${TELEGRAM_BOT_USERNAME}, atau kalau pakai grup tambahkan bot ke grup lalu kirim 1 pesan dulu sebelum test ulang.`;
  }

  if (normalizedError.includes('not configured') || normalizedError.includes('unauthorized')) {
    return 'Koneksi Telegram backend belum siap atau perlu dicek lagi. Coba test ulang sebentar lagi.';
  }

  return 'Pastikan Chat ID benar, bot sudah di-Start, dan untuk grup bot sudah ditambahkan sebagai member.';
}

export async function sendTelegramNotification(chatId: string, message: string) {
  const normalizedChatId = normalizeTelegramChatId(chatId);

  const { data, error } = await supabase.functions.invoke<TelegramFunctionResponse>('price-alerts', {
    body: {
      action: 'notify',
      alert: {
        telegramChatId: normalizedChatId,
        message,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Telegram notification failed');
  }

  return data;
}

export async function getTelegramBotStatus() {
  const { data, error } = await supabase.functions.invoke<TelegramFunctionResponse>('price-alerts', {
    body: { action: 'status' },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Telegram status check failed');
  }

  return data.bot;
}