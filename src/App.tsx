import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  Clock, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Download,
  Check
} from 'lucide-react';
import { FullEventPlan, CurrencyCode, BudgetItem, TimelineTask, VendorItem } from './types/event';
import { loadSavedPlan, savePlanToStorage } from './services/storage';
import { getPresetPlan } from './data/presetTemplates';
import { getStoredApiKey } from './services/geminiApi';
import { exportFullPlanToJson } from './services/exportUtils';

import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { BudgetTracker } from './components/BudgetTracker';
import { TimelinePlanner } from './components/TimelinePlanner';
import { VendorChecklist } from './components/VendorChecklist';
import { PersonalizedIdeas } from './components/PersonalizedIdeas';
import { AccessibilityHub } from './components/AccessibilityHub';
import { AiChatAssistant } from './components/AiChatAssistant';
import { EventWizardModal } from './components/EventWizardModal';
import { ApiKeyModal } from './components/ApiKeyModal';

export const App: React.FC = () => {
  const [plan, setPlan] = useState<FullEventPlan>(loadSavedPlan);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getStoredApiKey());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    savePlanToStorage(plan);
  }, [plan]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (presetId: string) => {
    const newPlan = getPresetPlan(presetId);
    setPlan(newPlan);
    showToast(`Loaded ${newPlan.details.title}`);
  };

  const handlePlanCreated = (newPlan: FullEventPlan) => {
    setPlan(newPlan);
    setActiveTab('overview');
    showToast(`Plan created for ${newPlan.details.title}!`);
  };

  const handleUpdateBudget = (newBudget: BudgetItem[]) => {
    setPlan((prev) => ({ ...prev, budget: newBudget }));
  };

  const handleUpdateTimeline = (newTimeline: TimelineTask[]) => {
    setPlan((prev) => ({ ...prev, timeline: newTimeline }));
  };

  const handleUpdateVendors = (newVendors: VendorItem[]) => {
    setPlan((prev) => ({ ...prev, vendors: newVendors }));
  };

  const handleToggleAccessibility = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      accessibility: prev.accessibility.map((a) =>
        a.id === id ? { ...a, isChecked: !a.isChecked } : a
      ),
    }));
  };

  const handleChangeCurrency = (curr: CurrencyCode) => {
    setPlan((prev) => ({
      ...prev,
      details: { ...prev.details, currency: curr },
    }));
  };

  const handleExportBackup = () => {
    exportFullPlanToJson(plan);
    showToast('Event plan JSON exported successfully.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget & Expenses', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline & Schedule', icon: <Clock className="w-4 h-4" /> },
    { id: 'vendors', label: 'Vendor Checklists', icon: <Users className="w-4 h-4" /> },
    { id: 'ideas', label: 'Ideas & Themes', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'accessibility', label: 'Accessibility Audit', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Chat Assistant', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-md shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-medium animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTitle={plan.details.title}
        currentType={plan.details.type}
        currentCurrency={plan.details.currency}
        onSelectPreset={handleSelectPreset}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onChangeCurrency={handleChangeCurrency}
        onReset={() => handleSelectPreset('preset-wedding-1')}
        hasApiKey={hasApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <nav
          aria-label="Event Sections"
          className="bg-white rounded-lg border border-slate-200 p-1.5 overflow-x-auto flex items-center gap-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="ml-auto pl-2 hidden lg:flex items-center gap-2 border-l border-slate-100">
            <button
              onClick={handleExportBackup}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              title="Export complete plan backup as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
          </div>
        </nav>

        {/* Tab Content Display */}
        <section aria-label="Section Content">
          {activeTab === 'overview' && (
            <DashboardOverview
              plan={plan}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTracker
              budget={plan.budget}
              totalBudget={plan.details.totalBudget}
              currency={plan.details.currency}
              eventTitle={plan.details.title}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelinePlanner
              timeline={plan.timeline}
              eventDate={plan.details.date}
              onUpdateTimeline={handleUpdateTimeline}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorChecklist
              vendors={plan.vendors}
              currency={plan.details.currency}
              onUpdateVendors={handleUpdateVendors}
            />
          )}

          {activeTab === 'ideas' && (
            <PersonalizedIdeas
              ideas={plan.ideas}
              eventTitle={plan.details.title}
            />
          )}

          {activeTab === 'accessibility' && (
            <AccessibilityHub
              items={plan.accessibility}
              onToggleItem={handleToggleAccessibility}
            />
          )}

          {activeTab === 'chat' && (
            <AiChatAssistant plan={plan} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Planora</span>
            <span className="text-slate-300">—</span>
            <span>Smart event planning for weddings, birthdays, and community gatherings</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>WCAG AA Accessible</span>
            <span>Zero-Server Privacy</span>
            <span>© 2026 Planora</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPlanCreated={handlePlanCreated}
        currentDetails={plan.details}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(key) => setHasApiKey(!!key)}
      />
    </div>
  );
};
