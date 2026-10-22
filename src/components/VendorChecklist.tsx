import React, { useState } from 'react';
import { 
  Users, 
  HelpCircle, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Phone, 
  Mail, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { VendorItem, VendorStatus, CurrencyCode } from '../types/event';
import { formatCurrency } from '../utils/formatters';

interface VendorChecklistProps {
  vendors: VendorItem[];
  currency: CurrencyCode;
  onUpdateVendors: (newVendors: VendorItem[]) => void;
}

const STATUS_ORDER: VendorStatus[] = [
  'researching',
  'contacted',
  'quoted',
  'contract_signed',
  'deposit_paid',
  'fully_paid',
];

const STATUS_LABELS: Record<VendorStatus, string> = {
  researching: 'Researching',
  contacted: 'Contacted',
  quoted: 'Quoted',
  contract_signed: 'Contract Signed',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
};

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  vendors,
  currency,
  onUpdateVendors,
}) => {
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(vendors[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(vendors.map((v) => v.category)));

  const handleToggleChecklist = (vendorId: string, itemIdx: number) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        const nextChecklist = [...v.checklistItems];
        nextChecklist[itemIdx] = {
          ...nextChecklist[itemIdx],
          done: !nextChecklist[itemIdx].done,
        };
        return { ...v, checklistItems: nextChecklist };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, status: newStatus };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  const filteredVendors = filterCategory === 'all'
    ? vendors
    : vendors.filter((v) => v.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Vendor Checklists & Negotiation Matrix
          </h2>
          <p className="text-xs text-slate-500">
            AI-generated interview questions, contract red flags, and milestone status tracking.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
              filterCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Vendors ({vendors.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="space-y-4">
        {filteredVendors.map((vendor) => {
          const isExpanded = expandedVendorId === vendor.id;
          const completedTasks = vendor.checklistItems.filter((i) => i.done).length;
          const totalTasks = vendor.checklistItems.length;

          return (
            <div
              key={vendor.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
            >
              {/* Header Strip */}
              <div
                onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {vendor.category}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-600 font-medium">{vendor.role}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{vendor.vendorName}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {vendor.quotedPrice && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Quote</span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(vendor.quotedPrice, currency)}
                      </span>
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={vendor.status}
                      onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-full border cursor-pointer ${
                        vendor.status === 'fully_paid' || vendor.status === 'contract_signed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : vendor.status === 'deposit_paid' || vendor.status === 'quoted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {STATUS_ORDER.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="text-slate-400 p-1 rounded-md hover:bg-slate-100">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/40">
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                    <span>Due Diligence Checklist</span>
                    <span>
                      {completedTasks} of {totalTasks} items completed
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {vendor.checklistItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleChecklist(vendor.id, idx)}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                          item.done
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-600 line-through'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Interview Questions & Red Flags */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                    {/* Questions */}
                    <div className="rounded-xl bg-white border border-indigo-100 p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h4>AI Interview Questions to Ask Before Signing</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {vendor.aiQuestionsToAsk.map((q, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-semibold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    <div className="rounded-xl bg-white border border-rose-100 p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <h4>Contract Red Flags to Watch For</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {vendor.redFlagsToWatch.map((rf, rfIdx) => (
                          <li key={rfIdx} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-semibold">⚠️</span>
                            <span>{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
