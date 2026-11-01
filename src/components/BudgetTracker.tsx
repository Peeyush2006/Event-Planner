import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  PieChart, 
  ArrowUpDown
} from 'lucide-react';
import { BudgetItem, BudgetCategory, PaymentStatus, CurrencyCode } from '../types/event';
import { formatCurrency } from '../utils/formatters';
import { exportBudgetToCsv } from '../services/exportUtils';
import { sanitizeText } from '../utils/validation';

interface BudgetTrackerProps {
  budget: BudgetItem[];
  totalBudget: number;
  currency: CurrencyCode;
  eventTitle: string;
  onUpdateBudget: (newBudget: BudgetItem[]) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue & Rentals',
  'Catering & Beverages',
  'Photography & Video',
  'Decor, Florals & Signage',
  'Music & Entertainment',
  'Attire & Beauty',
  'Permits, Insurance & Safety',
  'Stationery & Favors',
  'Logistics & Waste',
  'Contingency Fund',
];

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budget,
  totalBudget,
  currency,
  eventTitle,
  onUpdateBudget,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    category: BudgetCategory;
    name: string;
    estimatedCost: number;
    actualCost: number;
    status: PaymentStatus;
    notes: string;
  }>({
    category: 'Venue & Rentals',
    name: '',
    estimatedCost: 0,
    actualCost: 0,
    status: 'planned',
    notes: '',
  });

  const { totalEstimated, totalActual, remaining, isOverBudget, categoryTotals } = useMemo(() => {
    let est = 0;
    let act = 0;
    const totals: Record<string, { estimated: number; actual: number }> = {};

    for (const item of budget) {
      const e = Number(item.estimatedCost) || 0;
      const a = Number(item.actualCost) || 0;
      est += e;
      act += a;

      if (!totals[item.category]) {
        totals[item.category] = { estimated: 0, actual: 0 };
      }
      totals[item.category].estimated += e;
      totals[item.category].actual += a;
    }

    return {
      totalEstimated: est,
      totalActual: act,
      remaining: totalBudget - act,
      isOverBudget: act > totalBudget,
      categoryTotals: totals,
    };
  }, [budget, totalBudget]);

  const filteredBudget = useMemo(() => {
    return selectedCategory === 'all'
      ? budget
      : budget.filter((b) => b.category === selectedCategory);
  }, [budget, selectedCategory]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(formData.name).slice(0, 100);
    if (!cleanName) return;

    const newItem: BudgetItem = {
      id: `budget-${Date.now()}`,
      category: formData.category,
      name: cleanName,
      estimatedCost: Math.min(Math.max(0, Number(formData.estimatedCost) || 0), 100000000),
      actualCost: Math.min(Math.max(0, Number(formData.actualCost) || 0), 100000000),
      status: formData.status,
      notes: sanitizeText(formData.notes).slice(0, 500),
    };

    onUpdateBudget([...budget, newItem]);
    setIsAddingItem(false);
    setFormData({
      category: 'Venue & Rentals',
      name: '',
      estimatedCost: 0,
      actualCost: 0,
      status: 'planned',
      notes: '',
    });
  };

  const handleSaveEdit = (id: string) => {
    const cleanName = sanitizeText(formData.name).slice(0, 100);
    if (!cleanName) return;

    const updated = budget.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          name: cleanName,
          category: formData.category,
          estimatedCost: Math.min(Math.max(0, Number(formData.estimatedCost) || 0), 100000000),
          actualCost: Math.min(Math.max(0, Number(formData.actualCost) || 0), 100000000),
          status: formData.status,
          notes: sanitizeText(formData.notes).slice(0, 500),
        };
      }
      return b;
    });
    onUpdateBudget(updated);
    setEditingItemId(null);
  };

  const startEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setFormData({
      category: item.category,
      name: item.name,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      status: item.status,
      notes: item.notes || '',
    });
  };

  const handleDeleteItem = (id: string) => {
    onUpdateBudget(budget.filter((b) => b.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const nextStatusMap: Record<PaymentStatus, PaymentStatus> = {
      planned: 'deposit_paid',
      deposit_paid: 'paid_in_full',
      paid_in_full: 'planned',
    };
    const updated = budget.map((b) => {
      if (b.id === id) {
        return { ...b, status: nextStatusMap[b.status] };
      }
      return b;
    });
    onUpdateBudget(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Budget Breakdown & Expense Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Track estimated vs. actual expenses and monitor category limits in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBudgetToCsv(budget, eventTitle)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setIsAddingItem(true);
              setEditingItemId(null);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Target Budget
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalBudget, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planned allocations: {formatCurrency(totalEstimated, currency)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Actual Paid Out
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalActual, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round((totalActual / (totalBudget || 1)) * 100)}% of total budget utilized
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Remaining Balance
          </span>
          <div className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(remaining, currency)}
          </div>
          <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isOverBudget ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Budget limit exceeded</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Within planned budget</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Categories ({budget.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = budget.filter((b) => b.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Add / Edit Form Modal or Banner */}
      {isAddingItem && (
        <form
          onSubmit={handleAddItem}
          className="rounded-xl bg-indigo-50/50 border border-indigo-200 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-950">Add New Expense Item</h3>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Wedding Cake Tasting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
              </input>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estimated Cost</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Actual Paid</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="planned">Planned (Unpaid)</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid_in_full">Paid in Full</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Notes / Vendor Details</label>
              <input
                type="text"
                placeholder="Contract reference or terms"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Items Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Item Name & Notes</th>
                <th className="py-3 px-4 text-right">Estimated</th>
                <th className="py-3 px-4 text-right">Actual Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudget.map((item) => {
                const isEditing = editingItemId === item.id;

                if (isEditing) {
                  return (
                    <tr key={item.id} className="bg-indigo-50/40">
                      <td className="p-3">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 space-y-1">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded bg-white font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full p-1 text-slate-500 border border-slate-200 rounded bg-white"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={formData.estimatedCost}
                          onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                          className="w-24 p-1.5 border border-slate-300 rounded bg-white text-right"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={formData.actualCost}
                          onChange={(e) => setFormData({ ...formData, actualCost: parseFloat(e.target.value) || 0 })}
                          className="w-24 p-1.5 border border-slate-300 rounded bg-white text-right"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                          className="p-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="planned">Planned</option>
                          <option value="deposit_paid">Deposit Paid</option>
                          <option value="paid_in_full">Paid in Full</option>
                        </select>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(item.estimatedCost, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.actualCost, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          item.status === 'paid_in_full'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'deposit_paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Click to toggle payment status"
                      >
                        {item.status === 'paid_in_full' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {item.status === 'paid_in_full'
                          ? 'Paid in Full'
                          : item.status === 'deposit_paid'
                          ? 'Deposit Paid'
                          : 'Planned'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
