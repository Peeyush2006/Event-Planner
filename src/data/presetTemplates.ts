import { EventDetails } from '../types/event';
import { generateEventPlan } from '../services/heuristicEngine';

export const PRESET_EVENTS: EventDetails[] = [
  {
    id: 'preset-wedding-1',
    title: 'Serenade in the Pines Wedding',
    type: 'wedding',
    date: '2026-10-18',
    location: 'Pinecrest Mountain Haven, CA',
    guestCount: 125,
    totalBudget: 32000,
    currency: 'USD',
    vibe: 'rustic-outdoor',
    notes: 'Indoor/outdoor forest reception. Need outdoor heaters and acoustic trio for cocktail hour.',
    dietaryRestrictions: ['Vegetarian', 'Gluten-Free', 'Nut-Allergy'],
    createdAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'preset-birthday-1',
    title: 'Electric Glow 30th Milestone Bash',
    type: 'birthday',
    date: '2026-11-14',
    location: 'Loft 42 Rooftop Lounge, NY',
    guestCount: 50,
    totalBudget: 4200,
    currency: 'USD',
    vibe: 'colorful-festive',
    notes: 'Retro arcade vibes, neon signs, DJ set, and signature craft mocktails/cocktails.',
    dietaryRestrictions: ['Vegan options', 'Dairy-Free'],
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'preset-community-1',
    title: 'Oakwood Harvest Eco-Fair & 5K',
    type: 'community',
    date: '2026-10-31',
    location: 'Oakwood Community Central Park',
    guestCount: 400,
    totalBudget: 9500,
    currency: 'USD',
    vibe: 'eco-friendly',
    notes: 'Zero-waste event, local artisan booths, kids educational workshops, municipal permits approved.',
    dietaryRestrictions: ['Accessible water stations', 'Halal food truck'],
    createdAt: '2026-10-10T12:00:00Z',
  },
];

export function getPresetPlan(presetId: string) {
  const details = PRESET_EVENTS.find((p) => p.id === presetId) || PRESET_EVENTS[0];
  return generateEventPlan(details);
}
