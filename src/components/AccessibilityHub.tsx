import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  Heart, 
  Eye, 
  Utensils, 
  Volume2, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { AccessibilityCheckItem } from '../types/event';

interface AccessibilityHubProps {
  items: AccessibilityCheckItem[];
  onToggleItem: (id: string) => void;
}

export const AccessibilityHub: React.FC<AccessibilityHubProps> = ({
  items,
  onToggleItem,
}) => {
  const verifiedCount = items.filter((i) => i.isChecked).length;
  const totalCount = items.length;
  const scorePercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'physical':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'dietary':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'sensory':
        return <Volume2 className="w-4 h-4 text-purple-600" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Heart className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Accessibility & Community Inclusion Audit
          </h2>
          <p className="text-xs text-slate-500">
            Ensure your event is welcoming, safe, and universally accessible for all attendees.
          </p>
        </div>

        {/* Inline Score */}
        <p className="text-sm text-slate-600 font-medium whitespace-nowrap">
          <span className="font-bold text-slate-900">{verifiedCount}/{totalCount}</span> verified{' '}
          <span className="text-slate-400">({scorePercent}%)</span>
        </p>
      </div>

      {/* Educational Advisory Callout */}
      <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Why Inclusive Event Design Matters:</p>
          <p className="text-blue-800 leading-relaxed">
            Over 25% of attendees have dietary requirements, mobility preferences, or sensory sensitivities. Ensuring step-free access, clear allergen cards, and a quiet retreat zone prevents stress and guarantees every guest experiences celebration with dignity.
          </p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="checkbox"
            aria-checked={item.isChecked}
            tabIndex={0}
            onClick={() => onToggleItem(item.id)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onToggleItem(item.id);
              }
            }}
            className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
              item.isChecked
                ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                </span>

                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    item.priority === 'must-have'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.priority}
                </span>
              </div>

              <h3 className={`text-sm font-bold ${item.isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
