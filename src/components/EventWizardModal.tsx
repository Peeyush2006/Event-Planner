import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  PartyPopper, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  AlertTriangle,
  HeartHandshake,
  Check
} from 'lucide-react';
import { EventDetails, EventType, EventVibe, CurrencyCode, FullEventPlan } from '../types/event';
import { validateEventInput, analyzeBudgetFeasibility, sanitizeText } from '../utils/validation';
import { generateAiEventPlan } from '../services/geminiApi';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: FullEventPlan) => void;
  currentDetails?: EventDetails;
}

const VIBES: { id: EventVibe; label: string; desc: string }[] = [
  { id: 'classic-elegant', label: 'Classic & Elegant', desc: 'Timeless, sophisticated, formal' },
  { id: 'rustic-outdoor', label: 'Rustic & Outdoor', desc: 'Warm wood, foliage, barn/garden' },
  { id: 'modern-minimalist', label: 'Modern & Minimalist', desc: 'Clean lines, monochromatic, sleek' },
  { id: 'boho-chic', label: 'Boho & Whimsical', desc: 'Macrame, wildflowers, earthy tones' },
  { id: 'colorful-festive', label: 'Colorful & Festive', desc: 'Vibrant hues, joyful, high energy' },
  { id: 'retro-vintage', label: 'Retro & Vintage', desc: 'Nostalgic, disco/arcade, speakeasy' },
  { id: 'eco-friendly', label: 'Eco-Friendly & Sustainable', desc: 'Zero-waste, local, nature-focused' },
  { id: 'cultural-traditional', label: 'Cultural & Traditional', desc: 'Heritage rituals, rich symbolism' },
];

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  currentDetails,
}) => {
  if (!isOpen) return null;

  const [eventType, setEventType] = useState<EventType>(currentDetails?.type || 'wedding');
  const [title, setTitle] = useState(currentDetails?.title || '');
  const [date, setDate] = useState(currentDetails?.date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [location, setLocation] = useState(currentDetails?.location || 'Central Park Conservatory, NY');
  const [guestCount, setGuestCount] = useState<number>(currentDetails?.guestCount || 100);
  const [budget, setBudget] = useState<number>(currentDetails?.totalBudget || 25000);
  const [currency, setCurrency] = useState<CurrencyCode>(currentDetails?.currency || 'USD');
  const [vibe, setVibe] = useState<EventVibe>(currentDetails?.vibe || 'classic-elegant');
  const [notes, setNotes] = useState(currentDetails?.notes || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const feasibility = analyzeBudgetFeasibility(eventType, budget, guestCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateEventInput({
      title,
      guestCount,
      totalBudget: budget,
      date,
      location,
    });

    if (!validation.isValid) {
      setErrorMsg(Object.values(validation.errors)[0]);
      return;
    }

    setIsLoading(true);

    const details: EventDetails = {
      id: currentDetails?.id || `event-${Date.now()}`,
      title: sanitizeText(title),
      type: eventType,
      date,
      location: sanitizeText(location),
      guestCount: Number(guestCount),
      totalBudget: Number(budget),
      currency,
      vibe,
      notes: sanitizeText(notes),
      createdAt: currentDetails?.createdAt || new Date().toISOString(),
    };

    try {
      const { plan } = await generateAiEventPlan(details);
      onPlanCreated(plan);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {currentDetails ? 'Edit Event Parameters' : 'Create New GenAI Event Plan'}
              </h2>
              <p className="text-xs text-indigo-200">
                Planora AI will tailor budgets, timelines, checklists & ideas to this context.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Choose Event Type */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Event Vertical</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'wedding', label: 'Wedding', icon: <PartyPopper className="w-4 h-4 text-rose-500" /> },
                { type: 'birthday', label: 'Birthday Party', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
                { type: 'community', label: 'Community Event', icon: <Users className="w-4 h-4 text-emerald-500" /> },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => {
                    setEventType(item.type as EventType);
                    if (!title || title.includes('Wedding') || title.includes('Birthday') || title.includes('Event')) {
                      setTitle(`My Special ${item.label}`);
                    }
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    eventType === item.type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maya & Julian’s Botanical Wedding"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City or Venue Name</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sonoma Valley Winery, CA"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
          </div>

          {/* Date, Guests, Budget, Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Guest Headcount</label>
              <input
                type="number"
                min="1"
                max="10000"
                required
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Target Budget</label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-slate-100 border border-slate-300 rounded-xl px-2 py-2 text-slate-700 font-semibold"
                >
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="GBP">£</option>
                  <option value="INR">₹</option>
                  <option value="CAD">CA$</option>
                  <option value="AUD">A$</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Feasibility Alert */}
          {!feasibility.isFeasible && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <p className="font-semibold">{feasibility.warning}</p>
              <p className="text-[11px] text-amber-800">{feasibility.advice}</p>
            </div>
          )}

          {/* Aesthetic Vibe */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Vibe & Aesthetic Tone</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIBES.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setVibe(v.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    vibe === v.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">{v.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Special Notes & Restrictions */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Special Notes (Dietary needs, cultural traditions, specific wishes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Outdoor garden setting with gluten-free options and acoustic live band for cocktail hour."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating AI Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
