import { CurrencyCode } from '../types/event';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Not set';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export interface CountdownResult {
  totalDays: number;
  months: number;
  days: number;
  isPast: boolean;
  statusText: string;
}

export function calculateCountdown(targetDateStr: string): CountdownResult {
  if (!targetDateStr) {
    return { totalDays: 0, months: 0, days: 0, isPast: false, statusText: 'Date not set' };
  }

  const now = new Date();
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - now.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays < 0) {
    return {
      totalDays: Math.abs(totalDays),
      months: 0,
      days: Math.abs(totalDays),
      isPast: true,
      statusText: `${Math.abs(totalDays)} days ago`,
    };
  }

  if (totalDays === 0) {
    return {
      totalDays: 0,
      months: 0,
      days: 0,
      isPast: false,
      statusText: 'Today is the big day!',
    };
  }

  const months = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  let text = '';
  if (months > 0) {
    text = `${months} mo ${remainingDays} d left`;
  } else {
    text = `${totalDays} days left`;
  }

  return {
    totalDays,
    months,
    days: remainingDays,
    isPast: false,
    statusText: text,
  };
}
