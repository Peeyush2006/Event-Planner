/**
 * Input sanitization and validation utilities
 * Ensures high security: prevents XSS, injection, and invalid event parameters.
 */

export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Strip full HTML tags to prevent XSS
    .slice(0, 1000); // Limit length to avoid memory bloat
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
  } else if (data.guestCount > 10000) {
    errors.guestCount = 'Guest count cannot exceed 10,000 for standard planning';
  }

  if (data.totalBudget === undefined || data.totalBudget === null) {
    errors.totalBudget = 'Total budget is required';
  } else if (isNaN(data.totalBudget) || data.totalBudget < 0) {
    errors.totalBudget = 'Budget cannot be negative';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
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
