import { EventDetails, FullEventPlan, ChatMessage } from '../types/event';
import { generateEventPlan } from './heuristicEngine';

const API_KEY_STORAGE_KEY = 'planora_gemini_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

/**
 * Generate or augment an event plan using Gemini AI, with instant fallback to Heuristic Engine.
 */
export async function generateAiEventPlan(
  details: EventDetails,
  customInstructions?: string
): Promise<{ plan: FullEventPlan; source: 'gemini' | 'heuristic' }> {
  const apiKey = getStoredApiKey();

  // If no API key is provided, gracefully use the heuristic intelligence engine
  if (!apiKey) {
    return {
      plan: generateEventPlan(details),
      source: 'heuristic',
    };
  }

  const prompt = `You are Planora, an expert GenAI event planning director.
Generate a structured JSON event plan for the following event:
Event Type: ${details.type}
Title: ${details.title}
Target Date: ${details.date}
Guest Count: ${details.guestCount}
Total Budget: ${details.currency} ${details.totalBudget}
Vibe/Style: ${details.vibe}
Location: ${details.location}
Notes: ${details.notes || 'None'}
${customInstructions ? `Special Instructions: ${customInstructions}` : ''}

You must return ONLY a valid JSON object matching this structure:
{
  "budget": [
    {
      "id": "b-1",
      "category": "Venue & Rentals",
      "name": "string",
      "estimatedCost": number,
      "actualCost": 0,
      "status": "planned",
      "notes": "string"
    }
  ],
  "timeline": [
    {
      "id": "t-1",
      "phase": "early-planning" | "vendor-booking" | "details-coordination" | "final-countdown" | "day-of-execution",
      "phaseLabel": "string",
      "title": "string",
      "description": "string",
      "dueDate": "YYYY-MM-DD",
      "priority": "high" | "medium" | "low",
      "status": "todo",
      "timeSlot": "optional e.g. 09:00 AM - 10:30 AM for day of",
      "category": "string"
    }
  ],
  "vendors": [
    {
      "id": "v-1",
      "category": "string",
      "role": "string",
      "vendorName": "string",
      "status": "researching",
      "quotedPrice": number,
      "checklistItems": [{"text": "string", "done": false}],
      "aiQuestionsToAsk": ["string"],
      "redFlagsToWatch": ["string"]
    }
  ],
  "ideas": [
    {
      "id": "i-1",
      "category": "theme" | "menu" | "activity" | "decor" | "music",
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "colorPalette": [{"name": "string", "hex": "#HEX"}],
      "suggestedItems": ["string"]
    }
  ],
  "accessibility": [
    {
      "id": "a-1",
      "category": "physical" | "sensory" | "dietary" | "communication" | "safety",
      "title": "string",
      "description": "string",
      "isChecked": boolean,
      "priority": "must-have" | "recommended"
    }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to heuristic engine', response.statusText);
      return {
        plan: generateEventPlan(details),
        source: 'heuristic',
      };
    }

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No content returned from Gemini');

    const parsed = JSON.parse(rawText);
    const fallback = generateEventPlan(details);

    return {
      plan: {
        details,
        budget: Array.isArray(parsed.budget) && parsed.budget.length > 0 ? parsed.budget : fallback.budget,
        timeline: Array.isArray(parsed.timeline) && parsed.timeline.length > 0 ? parsed.timeline : fallback.timeline,
        vendors: Array.isArray(parsed.vendors) && parsed.vendors.length > 0 ? parsed.vendors : fallback.vendors,
        ideas: Array.isArray(parsed.ideas) && parsed.ideas.length > 0 ? parsed.ideas : fallback.ideas,
        accessibility: Array.isArray(parsed.accessibility) && parsed.accessibility.length > 0 ? parsed.accessibility : fallback.accessibility,
      },
      source: 'gemini',
    };
  } catch (error) {
    console.error('Error generating event with Gemini, using heuristic engine:', error);
    return {
      plan: generateEventPlan(details),
      source: 'heuristic',
    };
  }
}

/**
 * Handle interactive conversational chat with Planora AI
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  currentPlan: FullEventPlan,
  userPrompt: string
): Promise<string> {
  const apiKey = getStoredApiKey();

  // If no API key, use context-aware smart response engine
  if (!apiKey) {
    return generateOfflineChatResponse(currentPlan, userPrompt);
  }

  const systemContext = `You are Planora, an empathetic, organized, elite event planning assistant.
The user is planning a ${currentPlan.details.type} event titled "${currentPlan.details.title}".
Guest Count: ${currentPlan.details.guestCount}
Budget: ${currentPlan.details.currency} ${currentPlan.details.totalBudget}
Date: ${currentPlan.details.date}
Location: ${currentPlan.details.location}
Current budget items count: ${currentPlan.budget.length}
Current tasks count: ${currentPlan.timeline.length}

Answer the user's question clearly, constructively, and formatted in clean markdown. Provide actionable tips, realistic pricing considerations, negotiation advice, or timeline recommendations. Keep replies friendly, concise, and professional.`;

  try {
    const formattedContents = [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: "Understood! I'm ready to assist with planning this event." }] },
      ...messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userPrompt }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      return generateOfflineChatResponse(currentPlan, userPrompt);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateOfflineChatResponse(currentPlan, userPrompt);
  } catch (e) {
    return generateOfflineChatResponse(currentPlan, userPrompt);
  }
}

/**
 * High-quality offline conversational planner response engine
 */
function generateOfflineChatResponse(plan: FullEventPlan, prompt: string): string {
  const lower = prompt.toLowerCase();
  const currency = plan.details.currency;
  const budget = plan.details.totalBudget;
  const guests = plan.details.guestCount;
  const type = plan.details.type;

  if (lower.includes('cut') || lower.includes('save') || lower.includes('reduce') || lower.includes('budget')) {
    return `### 💡 Planora Cost-Saving Recommendations for Your ${type.toUpperCase()}:

1. **Catering Strategy**:
   - For ${guests} guests, switching from plated service to a **buffet or interactive food stations** typically saves **15% to 25%** on staffing and plating fees.
   - Limit the bar to beer, wine, and two signature craft cocktails/mocktails rather than a full open liquor bar.

2. **Floral & Decor Optimization**:
   - Repurpose ceremony arrangements (such as aisle markers and arch florals) as reception sweetheart and buffet centerpieces.
   - Mix high and low centerpieces; use potted greenery or hurricane candles on half the tables.

3. **Digital Stationery**:
   - Send digital Save-the-Dates and collect RSVPs via a custom wedding/event website. This saves \$300–\$800 in luxury paper, printing, and postage.

4. **Off-Peak Timing**:
   - Friday evenings or Sunday daytime slots often discount venue rental fees by **20% to 35%** compared to Saturday nights.`;
  }

  if (lower.includes('vendor') || lower.includes('contract') || lower.includes('negotiat') || lower.includes('red flag')) {
    return `### 🔍 Vendor Negotiation & Contract Protection Checklist:

- **Force Majeure & Weather Clause**: Ensure the contract clearly outlines reschedule terms without forfeiture of deposit in case of extreme weather or city emergencies.
- **Hidden Fees Audit**: Ask caterers and venues to confirm whether the quote includes service charges, setup/teardown fees, corkage, and cake-cutting fees.
- **Payment Milestones**: Never pay more than 25-50% upfront. Balance should be due 7-14 days prior to event or upon final delivery.
- **Overtime Rates**: Agree in advance on the exact per-hour rate if speeches or dancing extend beyond the agreed contract window.`;
  }

  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('run of show') || lower.includes('hour')) {
    return `### ⏱️ Recommended Day-Of Flow for ${plan.details.title}:

- **T-3 Hours**: Vendor load-in begins (sound equipment, floral deliveries, catering prep).
- **T-1.5 Hours**: VIP portraits and bridal/family first look.
- **T-30 Min**: Background music commences, beverage stations open, ushers greet guests.
- **Hour 0**: Main Ceremony / Grand Entrance.
- **Hour 1.0**: Cocktail hour, mingling, and interactive guest activities.
- **Hour 2.0**: Dinner service & toasts / keynote speeches.
- **Hour 3.0**: Cake cutting, dessert station, and open dance floor.
- **Hour 4.0 - Finish**: Grand sparkler exit or final celebration send-off & teardown.`;
  }

  if (lower.includes('idea') || lower.includes('theme') || lower.includes('cocktail') || lower.includes('activity')) {
    return `### ✨ Creative Enhancements for Your ${plan.details.vibe} Vibe:

- **Interactive Guest Feature**: A Polaroid guestbook wall or a retro audio guestbook telephone where guests leave 60-second voicemail memories.
- **Signature Welcome Mocktail**: Sparkling rosemary peach spritzer served in vintage glassware upon arrival.
- **Late-Night Surprise**: Around 10:00 PM, bring out mini warm grilled cheese triangles with tomato soup shooters or gourmet churros.
- **Ambiance Lighting**: Warm 2700K amber festoon lights with tabletop brass hurricane lanterns create unmatched intimacy in any space.`;
  }

  return `### 📋 Planora Assistant Insights for "${plan.details.title}":

- **Headcount**: ${guests} confirmed guests
- **Total Budget**: ${currency} ${budget.toLocaleString()} (~${currency} ${Math.round(budget / Math.max(1, guests))} per guest)
- **Status**: You have ${plan.budget.length} budgeted categories and ${plan.timeline.length} milestone tasks scheduled.

Would you like me to:
1. Help adjust your budget allocation?
2. Draft specific interview questions for your caterer or venue?
3. Generate customized icebreaker activities?
4. Review your day-of minute-by-minute timeline?`;
}
