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
import { formatCurrency, calculateCountdown } from '../utils/formatters';
import { EventDetails } from '../types/event';

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

  it('should warn when per-guest budget is unrealistically low', () => {
    // $2,000 for 100 wedding guests = $20/head (unfeasible)
    const result = analyzeBudgetFeasibility('wedding', 2000, 100);
    expect(result.isFeasible).toBe(false);
    expect(result.warning).toBeDefined();
    expect(result.advice).toBeDefined();
  });
});

describe('Heuristic AI Generation Engine for Verticals', () => {
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
  });

  it('computes countdown accurately', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const countdown = calculateCountdown(futureDate.toISOString().split('T')[0]);
    expect(countdown.isPast).toBe(false);
    expect(countdown.totalDays).toBeGreaterThan(40);
  });
});
