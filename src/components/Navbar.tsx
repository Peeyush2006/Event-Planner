import React from 'react';
import { 
  Calendar,
  PlusCircle, 
  RotateCcw, 
  PartyPopper, 
  Sparkles,
  Users 
} from 'lucide-react';
import { EventType, CurrencyCode } from '../types/event';
import { PRESET_EVENTS } from '../data/presetTemplates';

interface NavbarProps {
  currentTitle: string;
  currentType: EventType;
  currentCurrency: CurrencyCode;
  onSelectPreset: (presetId: string) => void;
  onOpenWizard: () => void;
  onOpenApiKeyModal: () => void;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onReset: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTitle,
  currentType,
  currentCurrency,
  onSelectPreset,
  onOpenWizard,
  onOpenApiKeyModal,
  onChangeCurrency,
  onReset,
  hasApiKey,
}) => {
  const getEventBadge = () => {
    switch (currentType) {
      case 'wedding':
        return {
          icon: <PartyPopper className="w-3.5 h-3.5 text-rose-500" />,
          label: 'Wedding',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'birthday':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Birthday',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'community':
        return {
          icon: <Users className="w-3.5 h-3.5 text-emerald-500" />,
          label: 'Community',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
    }
  };

  const badge = getEventBadge();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Planora<span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                  Beta
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Weddings • Birthdays • Community Events
              </p>
            </div>
          </div>

          {/* Current Event Context */}
          <div className="hidden md:flex items-center gap-2.5 text-sm">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${badge.badgeClass}`}>
              {badge.icon}
              {badge.label}
            </span>
            <span className="text-slate-300 select-none">|</span>
            <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={currentTitle}>
              {currentTitle}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Template Selector */}
            <div className="relative">
              <select
                aria-label="Select Event Template"
                className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg border border-slate-200 cursor-pointer transition-colors appearance-none"
                onChange={(e) => onSelectPreset(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Templates
                </option>
                {PRESET_EVENTS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.type.toUpperCase()}: {preset.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <select
                id="currency-select"
                value={currentCurrency}
                onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 cursor-pointer transition-colors appearance-none"
                title="Change Currency"
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="INR">₹ INR</option>
                <option value="CAD">CA$ CAD</option>
                <option value="AUD">A$ AUD</option>
              </select>
            </div>

            {/* API Connection Status Indicator */}
            <button
              onClick={onOpenApiKeyModal}
              className="text-xs font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              title={hasApiKey ? 'Gemini API Key Connected' : 'Configure Gemini API Key (Offline heuristic AI active)'}
              aria-label="API Settings"
            >
              <span className={hasApiKey ? 'text-emerald-500' : 'text-slate-400'}>
                {hasApiKey ? '●' : '○'}
              </span>
              <span className={`hidden lg:inline ${hasApiKey ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasApiKey ? 'Connected' : 'Offline'}
              </span>
            </button>

            {/* Create New Event Wizard Button */}
            <button
              onClick={onOpenWizard}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs sm:text-sm py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              aria-label="Create New Event Plan"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
