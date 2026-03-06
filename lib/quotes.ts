import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'daily_quote';
const API_URL = 'https://zenquotes.io/api/today';
const FETCH_TIMEOUT_MS = 5000;

interface QuoteData {
  text: string;
  author: string;
  date: string;
}

const FALLBACK_QUOTES: readonly QuoteData[] = [
  { text: 'Even on tough days, remember: You\'ve got this.', author: 'Guidez', date: '' },
  { text: 'Every small step forward is progress worth celebrating.', author: 'Guidez', date: '' },
  { text: 'Asking for help is one of the bravest things you can do.', author: 'Guidez', date: '' },
  { text: 'You are worthy of recovery, love, and happiness.', author: 'Guidez', date: '' },
  { text: 'Healing is not linear — be patient with yourself.', author: 'Guidez', date: '' },
  { text: 'Today is a new opportunity to grow and begin again.', author: 'Guidez', date: '' },
  { text: 'It\'s okay to rest. You don\'t have to earn your peace.', author: 'Guidez', date: '' },
  { text: 'The strength you need is already inside you.', author: 'Guidez', date: '' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getFallbackQuote(): QuoteData {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];
}

export async function getDailyQuote(): Promise<QuoteData> {
  const today = todayKey();

  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as QuoteData;
      if (parsed.date === today && parsed.text && parsed.author) {
        return parsed;
      }
    }
  } catch {
    // cache miss — continue to fetch
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return getFallbackQuote();
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0 || !data[0].q?.trim()) {
      return getFallbackQuote();
    }

    const quote: QuoteData = {
      text: String(data[0].q),
      author: String(data[0].a || 'Unknown'),
      date: today,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quote)).catch(() => {});
    return quote;
  } catch {
    return getFallbackQuote();
  }
}
