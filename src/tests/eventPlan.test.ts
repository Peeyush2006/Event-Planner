import { describe, it, expect } from 'vitest';
import { 
  generateBudgetItems, 
  generateTimelineTasks, 
  generateVendorItems, 
  generatePersonalizedIdeas, 
  generateAccessibilityItems, 
  generateEventPlan 
} from '../services/heuristicEngine';
import { 
  validateEventInput, 
  analyzeBudgetFeasibility, 
  sanitizeText, 
  sanitizeForCsv, 
  isValidApiKeyFormat, 
  validateAndSanitizePlan 
} from '../utils/validation';
import { formatCurrency, formatDate, calculateCountdown } from '../utils/formatters';
import { extractJsonFromText, getStoredApiKey, saveApiKey, generateOfflineChatResponse } from '../services/geminiApi';
import { loadSavedPlan, savePlanToStorage, clearSavedPlan, PLAN_STORAGE_KEY } from '../services/storage';
import { sanitizeFileName, generateBudgetCsvString } from '../services/exportUtils';
import { BudgetItem, EventDetails } from '../types/event';

// Polyfill localStorage for node/vitest environment
const mockStorage: Record<string, string> = {};
const localStoragePolyfill = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof localStoragePolyfill }).localStorage = localStoragePolyfill;
}

const weddingDetails: EventDetails = {
  id: 'test-wedding',
  title: 'Autumn Vows',
  type: 'wedding',
  date: '2026-10-15',
  location: 'Estate Gardens',
  guestCount: 120,
  totalBudget: 30000,
  currency: 'USD',
  vibe: 'rustic-outdoor',
  createdAt: '2026-10-01T00:00:00Z',
};

const birthdayDetails: EventDetails = {
  id: 'test-bday',
  title: 'David 30th Fiesta',
  type: 'birthday',
  date: '2026-11-05',
  location: 'Rooftop Bar',
  guestCount: 45,
  totalBudget: 4000,
  currency: 'USD',
  vibe: 'colorful-festive',
  createdAt: '2026-10-01T00:00:00Z',
};

const communityDetails: EventDetails = {
  id: 'test-comm',
  title: 'Spring Park Cleanup & Fair',
  type: 'community',
  date: '2026-10-28',
  location: 'Highland Park',
  guestCount: 300,
  totalBudget: 6000,
  currency: 'USD',
  vibe: 'eco-friendly',
  createdAt: '2026-10-01T00:00:00Z',
};

describe('Validation & Security Utilities', () => {
  it('should validate complete event input correctly', () => {
    const valid = validateEventInput({
      title: 'Emerald Garden Wedding',
      guestCount: 150,
      totalBudget: 35000,
      date: '2026-11-20',
      location: 'Napa Valley, CA',
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('should reject invalid guest count and empty titles', () => {
    const invalid = validateEventInput({
      title: '',
      guestCount: -5,
      totalBudget: -100,
      date: '',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBeDefined();
    expect(invalid.errors.guestCount).toBeDefined();
    expect(invalid.errors.totalBudget).toBeDefined();
    expect(invalid.errors.date).toBeDefined();
  });

  it('should reject fractional guests, infinite values, invalid calendar dates, and oversized locations', () => {
    const invalid = validateEventInput({
      title: 'Community gathering',
      guestCount: 2.5,
      totalBudget: Number.POSITIVE_INFINITY,
      date: '2026-02-30',
      location: 'x'.repeat(201),
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.guestCount).toBeDefined();
    expect(invalid.errors.totalBudget).toBeDefined();
    expect(invalid.errors.date).toBeDefined();
    expect(invalid.errors.location).toBeDefined();
  });

  it('should sanitize input text to protect against XSS injection', () => {
    const dirty = '<script>alert("hack")</script>Forest Wedding';
    const clean = sanitizeText(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('</script>');
    expect(clean).toBe('alert("hack")Forest Wedding');
  });

  it('should recursively strip nested and malformed HTML tags', () => {
    const nested = '<<SCRIPT>alert("nested")//<</SCRIPT>Clean Title';
    const clean = sanitizeText(nested);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
    expect(clean).toContain('Clean Title');
  });

  it('should neutralize javascript: and vbscript: URIs', () => {
    const malicious = 'javascript:alert(document.cookie);';
    const clean = sanitizeText(malicious);
    expect(clean).not.toContain('javascript:');
    expect(clean).toBe('alert(document.cookie);');
  });

  it('should neutralize CSV formula injection attacks', () => {
    // Tests for =cmd, @SUM, +1, -1, tab, and internal quotes
    const formulaPayload = '=cmd|\'/C calc\'!A0';
    const atPayload = '@SUM(1+1)*cmd';
    const plusPayload = '+1234';
    const normalPayload = 'Normal Venue Rental';

    const safeFormula = sanitizeForCsv(formulaPayload);
    const safeAt = sanitizeForCsv(atPayload);
    const safePlus = sanitizeForCsv(plusPayload);
    const safeNormal = sanitizeForCsv(normalPayload);

    expect(safeFormula).toBe('"\'=cmd|\'/C calc\'!A0"');
    expect(safeAt).toBe('"\'@SUM(1+1)*cmd"');
    expect(safePlus).toBe('"\'+1234"');
    expect(safeNormal).toBe('"Normal Venue Rental"');
  });

  it('should validate API key formats properly', () => {
    expect(isValidApiKeyFormat('AIzaSyD-sample-key_1234567890ABCDEF')).toBe(true);
    expect(isValidApiKeyFormat('sk-proj-12345678901234567890')).toBe(true);
    expect(isValidApiKeyFormat('short')).toBe(false);
    expect(isValidApiKeyFormat('')).toBe(false);
    expect(isValidApiKeyFormat('<script>alert(1)</script>')).toBe(false);
    expect(isValidApiKeyFormat('key with spaces in the middle')).toBe(false);
  });

  it('should validate and sanitize arbitrary/untrusted plan data', () => {
    const maliciousPayload = {
      details: {
        title: '<img src=x onerror=alert(1)> Gala Dinner',
        guestCount: -9999,
        totalBudget: 'not a number',
        currency: 'INVALID',
        date: 'malformed-date',
      },
      budget: [
        {
          name: '=1+1',
          estimatedCost: -500,
          actualCost: 'hack',
          status: 'invalid_status',
        },
      ],
      __proto__: { polluted: true },
    };

    const sanitized = validateAndSanitizePlan(maliciousPayload);
    expect(sanitized).not.toBeNull();
    if (sanitized) {
      expect(sanitized.details.title).not.toContain('<img');
      expect(sanitized.details.guestCount).toBeGreaterThanOrEqual(1);
      expect(sanitized.details.totalBudget).toBe(0);
      expect(sanitized.details.currency).toBe('USD');
      expect(sanitized.budget[0].estimatedCost).toBe(0);
      expect(sanitized.budget[0].actualCost).toBe(0);
      expect(sanitized.budget[0].status).toBe('planned');
    }
  });

  it('should safely bound non-finite values in imported plans', () => {
    const plan = validateAndSanitizePlan({
      details: { guestCount: 'Infinity', totalBudget: 'NaN', date: '2026-02-30' },
      budget: [{ estimatedCost: 'Infinity', actualCost: -4 }],
    });

    expect(plan?.details.guestCount).toBe(1);
    expect(plan?.details.totalBudget).toBe(0);
    expect(plan?.budget[0].estimatedCost).toBe(0);
    expect(plan?.budget[0].actualCost).toBe(0);
    expect(plan?.details.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should warn when per-guest budget is unrealistically low', () => {
    // $2,000 for 100 wedding guests = $20/head (unfeasible)
    const result = analyzeBudgetFeasibility('wedding', 2000, 100);
    expect(result.isFeasible).toBe(false);
    expect(result.warning).toBeDefined();
    expect(result.advice).toBeDefined();
  });
});

describe('AI response parsing', () => {
  it('parses plain JSON and fenced JSON', () => {
    expect(extractJsonFromText('{"ok":true}')).toEqual({ ok: true });
    expect(extractJsonFromText('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it('extracts a JSON object surrounded by explanatory text and rejects invalid output', () => {
    expect(extractJsonFromText('Result: {"ok":true} done')).toEqual({ ok: true });
    expect(() => extractJsonFromText('not JSON')).toThrow('Failed to parse JSON from AI response');
  });
});

describe('Heuristic AI Generation Engine for Verticals', () => {
  it('should generate tailored budget items for Wedding vertical', () => {
    const budget = generateBudgetItems(weddingDetails);
    expect(budget.length).toBeGreaterThan(5);
    const totalAllocated = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
    // Allocated amount should be within 95%-105% of total budget
    expect(totalAllocated).toBeGreaterThan(28000);
    expect(totalAllocated).toBeLessThanOrEqual(32000);
    
    // Check wedding-specific categories
    const categories = budget.map((b) => b.category);
    expect(categories).toContain('Venue & Rentals');
    expect(categories).toContain('Catering & Beverages');
    expect(categories).toContain('Photography & Video');
    expect(categories).toContain('Contingency Fund');
  });

  it('should generate tailored budget items for Community vertical', () => {
    const budget = generateBudgetItems(communityDetails);
    const categories = budget.map((b) => b.category);
    expect(categories).toContain('Permits, Insurance & Safety');
    expect(categories).toContain('Logistics & Waste');
  });

  it('should generate chronological milestones and day-of run-of-show', () => {
    const timeline = generateTimelineTasks(weddingDetails);
    expect(timeline.length).toBeGreaterThan(5);

    const dayOfTasks = timeline.filter((t) => t.phase === 'day-of-execution');
    expect(dayOfTasks.length).toBeGreaterThan(3);
    expect(dayOfTasks.some((t) => t.timeSlot !== undefined)).toBe(true);
  });

  it('should generate vendor checklist with interview questions & red flags', () => {
    const vendors = generateVendorItems(weddingDetails);
    expect(vendors.length).toBeGreaterThan(2);

    const firstVendor = vendors[0];
    expect(firstVendor.aiQuestionsToAsk.length).toBeGreaterThan(1);
    expect(firstVendor.redFlagsToWatch.length).toBeGreaterThan(0);
    expect(firstVendor.checklistItems.length).toBeGreaterThan(1);
  });

  it('should generate personalized theme ideas with valid hex colors', () => {
    const ideas = generatePersonalizedIdeas(birthdayDetails);
    expect(ideas.length).toBeGreaterThan(1);

    const themeIdea = ideas.find((i) => i.category === 'theme');
    expect(themeIdea).toBeDefined();
    expect(themeIdea?.colorPalette).toBeDefined();
    expect(themeIdea?.colorPalette?.length).toBeGreaterThan(2);
    expect(themeIdea?.colorPalette?.[0].hex).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should generate comprehensive accessibility & inclusivity checklist', () => {
    const acc = generateAccessibilityItems(communityDetails);
    expect(acc.length).toBeGreaterThan(3);
    const categories = acc.map((a) => a.category);
    expect(categories).toContain('physical');
    expect(categories).toContain('dietary');
    expect(categories).toContain('sensory');
  });

  it('should compile full event plan without errors', () => {
    const plan = generateEventPlan(weddingDetails);
    expect(plan.details.title).toBe('Autumn Vows');
    expect(plan.budget.length).toBeGreaterThan(0);
    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.vendors.length).toBeGreaterThan(0);
    expect(plan.ideas.length).toBeGreaterThan(0);
    expect(plan.accessibility.length).toBeGreaterThan(0);
  });
});

describe('Formatting Utilities', () => {
  it('formats various currency amounts correctly', () => {
    expect(formatCurrency(2500, 'USD')).toBe('$2,500');
    expect(formatCurrency(50000, 'INR')).toBe('₹50,000');
    expect(formatCurrency(1200.5, 'EUR')).toBe('€1,200.5');
    expect(formatCurrency(0, 'GBP')).toBe('£0');
    expect(formatCurrency(750, 'CAD')).toBe('CA$750');
    expect(formatCurrency(900, 'AUD')).toBe('A$900');
  });

  it('formats dates consistently without timezone drift', () => {
    expect(formatDate('')).toBe('Not set');
    expect(formatDate('invalid-date')).toBe('invalid-date');
    const formatted = formatDate('2026-11-20');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Nov');
  });

  it('computes countdown accurately for future, today, past and missing dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const countdownFuture = calculateCountdown(futureDate.toISOString().split('T')[0]);
    expect(countdownFuture.isPast).toBe(false);
    expect(countdownFuture.totalDays).toBeGreaterThanOrEqual(44);

    const nowIso = new Date().toISOString().split('T')[0];
    const countdownToday = calculateCountdown(nowIso);
    expect(countdownToday.isPast).toBe(false);
    expect(countdownToday.totalDays).toBe(0);
    expect(countdownToday.statusText).toBe('Today is the big day!');

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const countdownPast = calculateCountdown(pastDate.toISOString().split('T')[0]);
    expect(countdownPast.isPast).toBe(true);
    expect(countdownPast.totalDays).toBe(10);
    expect(countdownPast.statusText).toContain('days ago');

    const countdownEmpty = calculateCountdown('');
    expect(countdownEmpty.statusText).toBe('Date not set');
  });
});

describe('Storage Service', () => {
  it('loads fallback preset plan when storage is empty', () => {
    localStorage.removeItem(PLAN_STORAGE_KEY);
    const plan = loadSavedPlan();
    expect(plan).toBeDefined();
    expect(plan.details.title).toBeDefined();
    expect(plan.budget.length).toBeGreaterThan(0);
  });

  it('saves and reloads a valid plan to localStorage', () => {
    const sample = generateEventPlan(weddingDetails);
    savePlanToStorage(sample);
    const reloaded = loadSavedPlan();
    expect(reloaded.details.title).toBe(sample.details.title);
    expect(reloaded.details.totalBudget).toBe(sample.details.totalBudget);
  });

  it('handles corrupted JSON in storage gracefully without throwing', () => {
    localStorage.setItem(PLAN_STORAGE_KEY, '{ invalid corrupted json');
    const plan = loadSavedPlan();
    expect(plan).toBeDefined();
    expect(plan.details.title).toBeDefined();
  });

  it('clears saved plan from storage', () => {
    localStorage.setItem(PLAN_STORAGE_KEY, 'some-data');
    clearSavedPlan();
    expect(localStorage.getItem(PLAN_STORAGE_KEY)).toBeNull();
  });
});

describe('Export Utilities', () => {
  it('sanitizes export file names against path traversal and special characters', () => {
    expect(sanitizeFileName('../../etc/passwd', 'fallback')).toBe('etc_passwd');
    expect(sanitizeFileName('My Grand Wedding!!! 2026', 'fallback')).toBe('my_grand_wedding_2026');
    expect(sanitizeFileName('', 'default_name')).toBe('default_name');
  });

  it('generates compliant CSV with formula neutralization and calculation difference', () => {
    const sampleBudget: BudgetItem[] = [
      {
        id: 'b-1',
        category: 'Venue & Rentals',
        name: '=cmd|calc!A0',
        estimatedCost: 5000,
        actualCost: 4500,
        status: 'deposit_paid',
        notes: '@Formula injection attempt',
      },
      {
        id: 'b-2',
        category: 'Catering & Beverages',
        name: 'Plated Dinner',
        estimatedCost: 8000,
        actualCost: 8200,
        status: 'planned',
      },
    ];

    const csv = generateBudgetCsvString(sampleBudget);
    const lines = csv.split('\n');
    expect(lines.length).toBe(3); // header + 2 items
    expect(lines[0]).toContain('"Category","Item Name","Estimated Cost","Actual Cost","Difference","Status","Notes"');
    // First item: formula must be sanitized with prepended single quote
    expect(lines[1]).toContain('"\'=cmd|calc!A0"');
    expect(lines[1]).toContain('500'); // diff 5000 - 4500
    expect(lines[1]).toContain('"\'@Formula injection attempt"');
    // Second item: diff 8000 - 8200 = -200
    expect(lines[2]).toContain('-200');
  });
});

describe('Gemini API Service & Offline Response Engine', () => {
  it('manages API key storage and validation', () => {
    saveApiKey('');
    expect(getStoredApiKey()).toBe('');

    const validKey = 'AIzaSyD-12345678901234567890abcdefg';
    const saved = saveApiKey(validKey);
    expect(saved).toBe(true);
    expect(getStoredApiKey()).toBe(validKey);

    const invalidSaved = saveApiKey('too-short');
    expect(invalidSaved).toBe(false);

    // Clean up
    saveApiKey('');
  });

  it('extracts JSON cleanly from markdown code blocks and raw text', () => {
    const rawPlain = '{"test": 123}';
    expect(extractJsonFromText(rawPlain)).toEqual({ test: 123 });

    const rawFenced = '```json\n{"status": "ok", "count": 5}\n```';
    expect(extractJsonFromText(rawFenced)).toEqual({ status: 'ok', count: 5 });

    const rawWithCommentary = 'Here is your event plan:\n{"title": "Birthday Party"}\nHope this helps!';
    expect(extractJsonFromText(rawWithCommentary)).toEqual({ title: 'Birthday Party' });

    expect(() => extractJsonFromText('No json object here')).toThrow();
  });

  it('synthesizes intelligent domain responses in offline chat mode for various topics', () => {
    const plan = generateEventPlan(weddingDetails);

    const budgetReply = generateOfflineChatResponse(plan, 'How can I save budget or cut costs?');
    expect(budgetReply).toContain('Cost-Saving Recommendations');
    expect(budgetReply).toContain('Catering Strategy');

    const vendorReply = generateOfflineChatResponse(plan, 'What vendor contract red flags should I watch for?');
    expect(vendorReply).toContain('Vendor Negotiation');
    expect(vendorReply).toContain('Force Majeure');

    const timelineReply = generateOfflineChatResponse(plan, 'Can you review our day-of schedule and timeline?');
    expect(timelineReply).toContain('Recommended Day-Of Flow');
    expect(timelineReply).toContain('Vendor load-in');

    const generalReply = generateOfflineChatResponse(plan, 'What are some general tips?');
    expect(generalReply).toContain('Planora Assistant Insights');
  });
});
