import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimelineTask, TaskPhase, TaskPriority, TaskStatus } from '../types/event';
import { formatDate } from '../utils/formatters';

interface TimelinePlannerProps {
  timeline: TimelineTask[];
  eventDate: string;
  onUpdateTimeline: (newTimeline: TimelineTask[]) => void;
}

const PHASES: { id: TaskPhase | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tasks' },
  { id: 'early-planning', label: 'Early Planning' },
  { id: 'vendor-booking', label: 'Vendor Booking' },
  { id: 'details-coordination', label: 'Details & RSVPs' },
  { id: 'final-countdown', label: 'Final Countdown' },
  { id: 'day-of-execution', label: 'Day-Of Run of Show' },
];

export const TimelinePlanner: React.FC<TimelinePlannerProps> = ({
  timeline,
  eventDate,
  onUpdateTimeline,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<TaskPhase | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    phase: TaskPhase;
    dueDate: string;
    priority: TaskPriority;
    timeSlot: string;
    category: string;
  }>({
    title: '',
    description: '',
    phase: 'early-planning',
    dueDate: eventDate || new Date().toISOString().split('T')[0],
    priority: 'medium',
    timeSlot: '',
    category: 'General',
  });

  const completedCount = timeline.filter((t) => t.status === 'completed').length;
  const progressPercent = timeline.length > 0 ? Math.round((completedCount / timeline.length) * 100) : 0;

  const filteredTasks = timeline.filter((task) => {
    const phaseMatch = selectedPhase === 'all' || task.phase === selectedPhase;
    const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
    return phaseMatch && priorityMatch;
  });

  const handleToggleTaskStatus = (id: string) => {
    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'completed',
      completed: 'todo',
    };

    const updated = timeline.map((task) => {
      if (task.id === id) {
        const nextStatus = nextStatusMap[task.status];
        if (nextStatus === 'completed') {
          // Trigger celebratory confetti effect
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } catch {}
        }
        return { ...task, status: nextStatus };
      }
      return task;
    });

    onUpdateTimeline(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      phase: taskForm.phase,
      phaseLabel: PHASES.find((p) => p.id === taskForm.phase)?.label || 'Planning',
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: 'todo',
      timeSlot: taskForm.timeSlot.trim() || undefined,
      category: taskForm.category.trim() || 'General',
    };

    onUpdateTimeline([...timeline, newTask]);
    setIsAddingTask(false);
    setTaskForm({
      title: '',
      description: '',
      phase: 'early-planning',
      dueDate: eventDate,
      priority: 'medium',
      timeSlot: '',
      category: 'General',
    });
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTimeline(timeline.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header and Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Chronological Timeline & Day-Of Run of Show
          </h2>
          <p className="text-xs text-slate-500">
            Intelligent countdown milestones and minute-by-minute execution schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>{completedCount} of {timeline.length} Completed</span>
            <span className="text-indigo-600">({progressPercent}%)</span>
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {PHASES.map((phase) => {
          const count = phase.id === 'all'
            ? timeline.length
            : timeline.filter((t) => t.phase === phase.id).length;

          return (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                selectedPhase === phase.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{phase.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedPhase === phase.id ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <form onSubmit={handleAddTask} className="rounded-xl bg-indigo-50/50 border border-indigo-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-950">Add Milestone or Run-of-Show Item</h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Officiant rehearsal walkthrough"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Phase</label>
              <select
                value={taskForm.phase}
                onChange={(e) => setTaskForm({ ...taskForm, phase: e.target.value as TaskPhase })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="early-planning">Early Planning</option>
                <option value="vendor-booking">Vendor Booking</option>
                <option value="details-coordination">Details & Logistics</option>
                <option value="final-countdown">Final Countdown</option>
                <option value="day-of-execution">Day-Of Run of Show</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Time Slot (For Day-Of)</label>
              <input
                type="text"
                placeholder="e.g. 04:00 PM - 04:45 PM"
                value={taskForm.timeSlot}
                onChange={(e) => setTaskForm({ ...taskForm, timeSlot: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">Description / Logistics Instructions</label>
            <textarea
              rows={2}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
              placeholder="Detailed notes or assignments for this milestone"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No milestones found for this filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 text-slate-500 opacity-80'
                    : isInProgress
                    ? 'bg-white border-indigo-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Status Checkbox Button */}
                    <button
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                      title={
                        isCompleted
                          ? 'Completed (Click to reset)'
                          : isInProgress
                          ? 'In Progress (Click to complete)'
                          : 'To Do (Click to start)'
                      }
                      aria-label={`Toggle status for ${task.title}`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isInProgress ? '•' : ''}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {task.phaseLabel}
                        </span>

                        {task.timeSlot && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            <span>{task.timeSlot}</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-700'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority} Priority
                        </span>

                        <span className="text-[11px] text-slate-500">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <h3
                        className={`font-semibold text-sm ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
