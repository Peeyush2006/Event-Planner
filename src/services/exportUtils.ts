import { FullEventPlan, BudgetItem } from '../types/event';

export function exportBudgetToCsv(budget: BudgetItem[], eventTitle: string): void {
  const headers = ['Category', 'Item Name', 'Estimated Cost', 'Actual Cost', 'Difference', 'Status', 'Notes'];
  
  const rows = budget.map((b) => {
    const diff = b.estimatedCost - b.actualCost;
    return [
      `"${b.category}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      b.estimatedCost,
      b.actualCost,
      diff,
      b.status,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${eventTitle.toLowerCase().replace(/\s+/g, '_')}_budget.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFullPlanToJson(plan: FullEventPlan): void {
  const jsonContent = JSON.stringify(plan, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${plan.details.title.toLowerCase().replace(/\s+/g, '_')}_plan.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
