export type EventType = 'wedding' | 'birthday' | 'community';

export type EventVibe = 
  | 'classic-elegant'
  | 'rustic-outdoor'
  | 'modern-minimalist'
  | 'boho-chic'
  | 'colorful-festive'
  | 'retro-vintage'
  | 'eco-friendly'
  | 'cultural-traditional';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface EventDetails {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  vibe: EventVibe;
  notes?: string;
  culturalNotes?: string;
  dietaryRestrictions?: string[];
  createdAt: string;
}

export type BudgetCategory = 
  | 'Venue & Rentals'
  | 'Catering & Beverages'
  | 'Photography & Video'
  | 'Decor, Florals & Signage'
  | 'Music & Entertainment'
  | 'Attire & Beauty'
  | 'Permits, Insurance & Safety'
  | 'Stationery & Favors'
  | 'Logistics & Waste'
  | 'Contingency Fund';

export type PaymentStatus = 'planned' | 'deposit_paid' | 'paid_in_full';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: PaymentStatus;
  notes?: string;
  vendorName?: string;
}

export type TaskPhase = 
  | 'early-planning' // 6-12 months or 2 months for birthday
  | 'vendor-booking' // 3-6 months
  | 'details-coordination' // 1-2 months
  | 'final-countdown' // 1-2 weeks
  | 'day-of-execution'; // Day-of run of show

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TimelineTask {
  id: string;
  phase: TaskPhase;
  phaseLabel: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  timeSlot?: string; // e.g. "09:00 AM - 10:30 AM" for day-of
  category?: string;
}

export type VendorStatus = 
  | 'researching'
  | 'contacted'
  | 'quoted'
  | 'contract_signed'
  | 'deposit_paid'
  | 'fully_paid';

export interface VendorItem {
  id: string;
  category: string;
  role: string; // e.g., "Main Caterer", "Lead Photographer", "Sound Engineer"
  vendorName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  quotedPrice?: number;
  status: VendorStatus;
  checklistItems: { text: string; done: boolean }[];
  aiQuestionsToAsk: string[];
  redFlagsToWatch: string[];
  contractNotes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface PersonalizedIdea {
  id: string;
  category: 'theme' | 'menu' | 'activity' | 'decor' | 'music';
  title: string;
  description: string;
  tags: string[];
  colorPalette?: ColorSwatch[];
  suggestedItems?: string[];
  estimatedCostRange?: string;
}

export interface AccessibilityCheckItem {
  id: string;
  category: 'physical' | 'sensory' | 'dietary' | 'communication' | 'safety';
  title: string;
  description: string;
  isChecked: boolean;
  priority: 'must-have' | 'recommended';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_task' | 'add_budget' | 'apply_theme';
    payload: Record<string, unknown>;
    label: string;
  };
}

export interface FullEventPlan {
  details: EventDetails;
  budget: BudgetItem[];
  timeline: TimelineTask[];
  vendors: VendorItem[];
  ideas: PersonalizedIdea[];
  accessibility: AccessibilityCheckItem[];
}
