import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { FullEventPlan } from '../types/event';
import { formatCurrency, formatDate, calculateCountdown } from '../utils/formatters';
import { analyzeBudgetFeasibility } from '../utils/validation';

interface DashboardOverviewProps {
  plan: FullEventPlan;
  onNavigateTab: (tab: string) => void;
  onOpenWizard: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  plan,
  onNavigateTab,
  onOpenWizard,
}) => {
  const { details, budget, timeline, vendors, accessibility } = plan;
  const countdown = calculateCountdown(details.date);

  // Financial Calculations
  const totalEstimated = budget.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  const totalActual = budget.reduce((sum, item) => sum + (Number(item.actualCost) || 0), 0);
  const remainingBudget = details.totalBudget - totalActual;
  const isOverBudget = totalActual > details.totalBudget;

  // Task Progress Calculations
  const completedTasks = timeline.filter((t) => t.status === 'completed').length;
  const totalTasks = timeline.length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Accessibility Progress
  const completedAcc = accessibility.filter((a) => a.isChecked).length;
  const totalAcc = accessibility.length;

  // Next Pending Task
  const nextTask = timeline.find((t) => t.status !== 'completed');

  // Feasibility Check
  const feasibility = analyzeBudgetFeasibility(details.type, details.totalBudget, details.guestCount);

  return (
    <div className="space-y-6">
      {/* Event Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {details.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Vibe: {details.vibe.replace('-', ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {countdown.statusText}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {details.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(details.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{details.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{details.guestCount} Invited Guests</span>
              </div>
            </div>
          </div>

          {/* Quick Edit & Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWizard}
              className="px-4 py-2 rounded-lg bg-white text-slate-700 font-medium text-xs sm:text-sm border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Edit Parameters
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Planora AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advisory Warning Banner if Feasibility is Low */}
      {!feasibility.isFeasible && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-amber-950">{feasibility.warning}</p>
            <p className="text-amber-800">{feasibility.advice}</p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Budget
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(details.totalBudget, details.currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ~{formatCurrency(feasibility.perGuestCost, details.currency)} / guest
            </p>
          </div>
        </div>

        {/* Expenses & Variance */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actual Spent
            </span>
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalActual, details.currency)}
            </div>
            <p className={`text-xs mt-1 font-medium ${isOverBudget ? 'text-rose-600' : 'text-slate-500'}`}>
              {isOverBudget
                ? `Exceeds budget by ${formatCurrency(totalActual - details.totalBudget, details.currency)}`
                : `${formatCurrency(remainingBudget, details.currency)} remaining`}
            </p>
          </div>
        </div>

        {/* Milestone Tasks Progress */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Timeline Progress
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{taskProgressPct}%</span>
              <span className="text-xs text-slate-500">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${taskProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Accessibility & Safety Score */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accessibility Audit
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {completedAcc}/{totalAcc}
              </span>
              <span className="text-xs text-slate-500">
                {Math.round((completedAcc / (totalAcc || 1)) * 100)}% verified
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Inclusive event checklist
            </p>
          </div>
        </div>
      </div>

      {/* Action Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Key Priority Milestone */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900">Next Priority Milestone</h2>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Full Timeline
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextTask ? (
            <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {nextTask.phaseLabel}
                </span>
                <span className="text-xs text-slate-500">
                  Due: {formatDate(nextTask.dueDate)}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base">{nextTask.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{nextTask.description}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>All milestones complete — your event is fully planned.</span>
            </div>
          )}

          {/* Quick Shortcuts Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onNavigateTab('budget')}
              className="p-3 rounded-md bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs font-semibold text-slate-700 flex flex-col gap-1"
            >
              <DollarSign className="w-4 h-4 text-slate-500" />
              Manage Budget
            </button>
            <button
              onClick={() => onNavigateTab('vendors')}
              className="p-3 rounded-md bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs font-semibold text-slate-700 flex flex-col gap-1"
            >
              <Users className="w-4 h-4 text-slate-500" />
              Vendor Checklist ({vendors.length})
            </button>
            <button
              onClick={() => onNavigateTab('ideas')}
              className="p-3 rounded-md bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs font-semibold text-slate-700 flex flex-col gap-1"
            >
              <Sparkles className="w-4 h-4 text-slate-500" />
              Theme & Ideas
            </button>
            <button
              onClick={() => onNavigateTab('accessibility')}
              className="p-3 rounded-md bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer text-xs font-semibold text-slate-700 flex flex-col gap-1"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Accessibility Hub
            </button>
          </div>
        </div>

        {/* Planning Insights Sidebar */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              <h3>Planning Insights</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your {details.guestCount}-guest count and {details.vibe.replace('-', ' ')} aesthetic:
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  Reserve catering tasting 4 months ahead to avoid rush menus.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  Keep a 10% contingency buffer ({formatCurrency(details.totalBudget * 0.1, details.currency)}) unallocated for surprise service fees.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  Confirm audio decibel limits with the venue manager before booking the DJ or band.
                </span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('chat')}
            className="mt-6 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Ask Planora Anything</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
