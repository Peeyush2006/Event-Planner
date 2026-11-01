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
    const parts = dateStr.split('-');
    let date: Date;
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
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

  const parts = targetDateStr.split('-');
  let target: Date;
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    target = new Date(year, month, day, 0, 0, 0, 0);
  } else {
    target = new Date(targetDateStr);
  }

  if (isNaN(target.getTime())) {
    return { totalDays: 0, months: 0, days: 0, isPast: false, statusText: 'Invalid date' };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

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
