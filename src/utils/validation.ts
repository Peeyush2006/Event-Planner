/**
 * Input sanitization, validation, and security utilities
 * Comprehensive defense against XSS, CSV injection, prototype pollution, and malformed payloads.
 */

import { FullEventPlan, BudgetItem, TimelineTask, VendorItem, PersonalizedIdea, AccessibilityCheckItem, CurrencyCode } from '../types/event';

const DANGEROUS_CSV_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Robustly sanitizes text strings to prevent HTML injection, script execution,
 * and dangerous URI protocols.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim();

  // Recursively strip any HTML/XML tags
  let previous = '';
  while (previous !== sanitized) {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Strip dangerous javascript: and data: protocols
  sanitized = sanitized.replace(/javascript\s*:/gi, '').replace(/vbscript\s*:/gi, '');

  // Normalize control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Restrict to max 2000 characters to prevent memory/DOM bloat
  return sanitized.slice(0, 2000);
}

/**
 * Escapes text destined for CSV export to prevent formula/command injection (OWASP CSV Injection).
 * If a cell begins with =, +, -, @, tab, or carriage return, it prepends a single quote.
 */
export function sanitizeForCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);

  // Check if string starts with dangerous spreadsheet formula triggers
  const trimmed = str.trimStart();
  const startsWithDangerous = DANGEROUS_CSV_PREFIXES.some((char) => trimmed.startsWith(char));
  
  const safeStr = startsWithDangerous ? `'${str}` : str;
  // Double-quote all internal quotes per RFC 4180
  return `"${safeStr.replace(/"/g, '""')}"`;
}

/**
 * Validates whether a Gemini API key matches expected standard format
 */
export function isValidApiKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // Google API keys typically start with AIzaSy and are 39 characters, or at least 20+ alphanumeric safe chars
  return /^[A-Za-z0-9_-]{20,80}$/.test(trimmed);
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEventInput(data: {
  title?: string;
  guestCount?: number;
  totalBudget?: number;
  date?: string;
  location?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Event title is required';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title must be under 120 characters';
  }

  if (data.guestCount === undefined || data.guestCount === null) {
    errors.guestCount = 'Guest count is required';
  } else if (isNaN(data.guestCount) || data.guestCount < 1) {
    errors.guestCount = 'Guest count must be at least 1';
  } else if (data.guestCount > 100000) {
    errors.guestCount = 'Guest count cannot exceed 100,000';
  }

  if (data.totalBudget === undefined || data.totalBudget === null) {
    errors.totalBudget = 'Total budget is required';
  } else if (isNaN(data.totalBudget) || data.totalBudget < 0) {
    errors.totalBudget = 'Budget cannot be negative';
  } else if (data.totalBudget > 1000000000) {
    errors.totalBudget = 'Budget cannot exceed $1,000,000,000';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = 'Date must be formatted as YYYY-MM-DD';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Deeply validates and sanitizes an entire event plan object loaded from storage or import.
 * Defends against prototype pollution, malformed types, and injected code.
 */
export function validateAndSanitizePlan(raw: unknown): FullEventPlan | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  try {
    const candidate = raw as Record<string, any>;
    if (!candidate.details || typeof candidate.details !== 'object') {
      return null;
    }

    const validCurrencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
    const currency: CurrencyCode = validCurrencies.includes(candidate.details.currency)
      ? candidate.details.currency
      : 'USD';

    const safeDetails = {
      id: sanitizeText(candidate.details.id) || `event-${Date.now()}`,
      title: sanitizeText(candidate.details.title) || 'My Planned Event',
      type: ['wedding', 'birthday', 'community'].includes(candidate.details.type) ? candidate.details.type : 'wedding',
      date: typeof candidate.details.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.details.date)
        ? candidate.details.date
        : new Date().toISOString().split('T')[0],
      location: sanitizeText(candidate.details.location) || 'TBD',
      guestCount: Math.min(Math.max(1, Number(candidate.details.guestCount) || 1), 100000),
      totalBudget: Math.min(Math.max(0, Number(candidate.details.totalBudget) || 0), 1000000000),
      currency,
      vibe: sanitizeText(candidate.details.vibe) || 'classic-elegant',
      notes: candidate.details.notes ? sanitizeText(candidate.details.notes) : undefined,
      createdAt: candidate.details.createdAt ? sanitizeText(candidate.details.createdAt) : new Date().toISOString(),
    };

    const safeBudget: BudgetItem[] = Array.isArray(candidate.budget)
      ? candidate.budget.slice(0, 150).map((b: any, idx: number) => ({
          id: sanitizeText(b.id) || `b-${idx}-${Date.now()}`,
          category: sanitizeText(b.category) || 'General',
          name: sanitizeText(b.name) || 'Expense Item',
          estimatedCost: Math.min(Math.max(0, Number(b.estimatedCost) || 0), 100000000),
          actualCost: Math.min(Math.max(0, Number(b.actualCost) || 0), 100000000),
          status: ['planned', 'deposit_paid', 'paid_in_full'].includes(b.status) ? b.status : 'planned',
          notes: b.notes ? sanitizeText(b.notes) : undefined,
        }))
      : [];

    const safeTimeline: TimelineTask[] = Array.isArray(candidate.timeline)
      ? candidate.timeline.slice(0, 200).map((t: any, idx: number) => ({
          id: sanitizeText(t.id) || `t-${idx}-${Date.now()}`,
          phase: t.phase || 'early-planning',
          phaseLabel: sanitizeText(t.phaseLabel) || 'Planning',
          title: sanitizeText(t.title) || 'Task',
          description: sanitizeText(t.description) || '',
          dueDate: typeof t.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : safeDetails.date,
          priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
          status: ['todo', 'in_progress', 'completed'].includes(t.status) ? t.status : 'todo',
          timeSlot: t.timeSlot ? sanitizeText(t.timeSlot) : undefined,
          category: t.category ? sanitizeText(t.category) : undefined,
        }))
      : [];

    const safeVendors: VendorItem[] = Array.isArray(candidate.vendors)
      ? candidate.vendors.slice(0, 50).map((v: any, idx: number) => ({
          id: sanitizeText(v.id) || `v-${idx}-${Date.now()}`,
          category: sanitizeText(v.category) || 'Vendor',
          role: sanitizeText(v.role) || 'Service Provider',
          vendorName: sanitizeText(v.vendorName) || 'TBD',
          status: ['researching', 'contacted', 'quoted', 'contract_signed', 'deposit_paid', 'fully_paid'].includes(v.status) ? v.status : 'researching',
          quotedPrice: v.quotedPrice !== undefined ? Math.max(0, Number(v.quotedPrice) || 0) : undefined,
          checklistItems: Array.isArray(v.checklistItems)
            ? v.checklistItems.slice(0, 20).map((c: any) => ({
                text: sanitizeText(c.text) || 'Step',
                done: Boolean(c.done),
              }))
            : [],
          aiQuestionsToAsk: Array.isArray(v.aiQuestionsToAsk) ? v.aiQuestionsToAsk.slice(0, 15).map(sanitizeText) : [],
          redFlagsToWatch: Array.isArray(v.redFlagsToWatch) ? v.redFlagsToWatch.slice(0, 15).map(sanitizeText) : [],
        }))
      : [];

    const safeIdeas: PersonalizedIdea[] = Array.isArray(candidate.ideas)
      ? candidate.ideas.slice(0, 30).map((i: any, idx: number) => ({
          id: sanitizeText(i.id) || `i-${idx}-${Date.now()}`,
          category: i.category || 'theme',
          title: sanitizeText(i.title) || 'Creative Idea',
          description: sanitizeText(i.description) || '',
          tags: Array.isArray(i.tags) ? i.tags.slice(0, 10).map(sanitizeText) : [],
          colorPalette: Array.isArray(i.colorPalette)
            ? i.colorPalette.slice(0, 8).map((c: any) => ({
                name: sanitizeText(c.name) || 'Color',
                hex: /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#6366f1',
              }))
            : undefined,
          suggestedItems: Array.isArray(i.suggestedItems) ? i.suggestedItems.slice(0, 15).map(sanitizeText) : undefined,
        }))
      : [];

    const safeAccessibility: AccessibilityCheckItem[] = Array.isArray(candidate.accessibility)
      ? candidate.accessibility.slice(0, 50).map((a: any, idx: number) => ({
          id: sanitizeText(a.id) || `a-${idx}-${Date.now()}`,
          category: a.category || 'physical',
          title: sanitizeText(a.title) || 'Checklist Item',
          description: sanitizeText(a.description) || '',
          isChecked: Boolean(a.isChecked),
          priority: ['must-have', 'recommended'].includes(a.priority) ? a.priority : 'recommended',
        }))
      : [];

    return {
      details: safeDetails,
      budget: safeBudget,
      timeline: safeTimeline,
      vendors: safeVendors,
      ideas: safeIdeas,
      accessibility: safeAccessibility,
    };
  } catch (err) {
    console.error('Plan sanitization error:', err);
    return null;
  }
}

/**
 * Checks for realistic budget per guest and returns advisory warnings
 */
export function analyzeBudgetFeasibility(eventType: string, budget: number, guests: number): {
  isFeasible: boolean;
  perGuestCost: number;
  warning?: string;
  advice?: string;
} {
  if (!guests || guests <= 0) return { isFeasible: true, perGuestCost: 0 };
  const perGuestCost = Math.round(budget / guests);

  if (eventType === 'wedding') {
    if (perGuestCost < 50) {
      return {
        isFeasible: false,
        perGuestCost,
        warning: `Average cost per guest (${perGuestCost}) is very tight for a full wedding with standard catering and venue.`,
        advice: 'Consider: DIY decor, digital invitations, cake & punch or cocktail reception, or trimming the guest list.',
      };
    }
  } else if (eventType === 'birthday') {
    if (perGuestCost < 15) {
      return {
        isFeasible: false,
        perGuestCost,
        warning: `Budget per guest (${perGuestCost}) may limit catering and entertainment options.`,
        advice: 'Consider hosting at a home/park, potluck dessert style, and Spotify playlist instead of paid DJ.',
      };
    }
  } else if (eventType === 'community') {
    if (perGuestCost < 10) {
      return {
        isFeasible: false,
        perGuestCost,
        warning: `Community events with under ${perGuestCost}/attendee rely heavily on volunteer labor, sponsors, and donated supplies.`,
        advice: 'Apply for municipal event grants, seek local business food truck vendors, and partner with local clubs.',
      };
    }
  }

  return { isFeasible: true, perGuestCost };
}
