import { FullEventPlan } from '../types/event';
import { PRESET_EVENTS, getPresetPlan } from '../data/presetTemplates';

const PLAN_STORAGE_KEY = 'planora_active_event_plan';

export function loadSavedPlan(): FullEventPlan {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.details && parsed.budget) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading plan from storage:', e);
  }
  // Default to preset wedding
  return getPresetPlan(PRESET_EVENTS[0].id);
}

export function savePlanToStorage(plan: FullEventPlan): void {
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving plan to storage:', e);
  }
}

export function clearSavedPlan(): void {
  try {
    localStorage.removeItem(PLAN_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing plan from storage:', e);
  }
}
