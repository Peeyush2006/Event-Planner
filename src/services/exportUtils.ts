import { FullEventPlan, BudgetItem } from '../types/event';
import { sanitizeForCsv } from '../utils/validation';

/**
 * Safely sanitizes a string for use in downloaded filenames
 * Prevents directory traversal and control characters
 */
export function sanitizeFileName(name: string, fallback: string): string {
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
  return safe || fallback;
}

/**
 * Generates an RFC 4180-compliant CSV string with OWASP injection protection
 */
export function generateBudgetCsvString(budget: BudgetItem[]): string {
  const headers = ['Category', 'Item Name', 'Estimated Cost', 'Actual Cost', 'Difference', 'Status', 'Notes'];
  
  const rows = budget.map((b) => {
    const diff = Number(b.estimatedCost || 0) - Number(b.actualCost || 0);
    return [
      sanitizeForCsv(b.category),
      sanitizeForCsv(b.name),
      Number(b.estimatedCost || 0),
      Number(b.actualCost || 0),
      diff,
      sanitizeForCsv(b.status),
      sanitizeForCsv(b.notes || ''),
    ];
  });

  return [headers.map(sanitizeForCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportBudgetToCsv(budget: BudgetItem[], eventTitle: string): void {
  const csvContent = generateBudgetCsvString(budget);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeTitle = sanitizeFileName(eventTitle, 'event');
  link.setAttribute('download', `${safeTitle}_budget.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFullPlanToJson(plan: FullEventPlan): void {
  const jsonContent = JSON.stringify(plan, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeTitle = sanitizeFileName(plan.details?.title || 'event', 'event');
  link.setAttribute('download', `${safeTitle}_plan.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
