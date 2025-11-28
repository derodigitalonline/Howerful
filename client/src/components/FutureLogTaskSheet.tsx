import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';
import { format, startOfToday } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface FutureLogTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (text: string, scheduledDate: string, time?: string) => void;
}

export default function FutureLogTaskSheet({
  open,
  onOpenChange,
  onAddTask,
}: FutureLogTaskSheetProps) {
  const [taskText, setTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [includeTime, setIncludeTime] = useState(false);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !selectedDate) return;

    // Format date as YYYY-MM-DD
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    // Format time if included
    let formattedTime: string | undefined = undefined;
    if (includeTime) {
      const hour24 = period === 'PM' && hour !== '12'
        ? String(parseInt(hour) + 12).padStart(2, '0')
        : period === 'AM' && hour === '12'
        ? '00'
        : hour.padStart(2, '0');
      formattedTime = `${hour24}:${minute}`;
    }

    onAddTask(taskText.trim(), formattedDate, formattedTime);

    // Reset form
    setTaskText('');
    setSelectedDate(undefined);
    setIncludeTime(false);
    setHour('12');
    setMinute('00');
    setPeriod('PM');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTaskText('');
    setSelectedDate(undefined);
    setIncludeTime(false);
    setHour('12');
    setMinute('00');
    setPeriod('PM');
    onOpenChange(false);
  };

  const today = startOfToday();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleCancel}
        />
      )}

      {/* Side Sheet */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[550px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add to Future Log</h2>
              <p className="text-sm text-muted-foreground">
                Schedule a task for a specific date
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Description
            </label>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="What do you need to do?"
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              autoFocus
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Scheduled Date
            </label>
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <style>{`
                .rdp {
                  --rdp-cell-size: 40px;
                  --rdp-accent-color: hsl(var(--primary));
                  --rdp-background-color: hsl(var(--primary) / 0.1);
                  margin: 0;
                }
                .rdp-months {
                  justify-content: center;
                }
                .rdp-month {
                  width: 100%;
                }
                .rdp-table {
                  max-width: 100%;
                  margin: 0 auto;
                }
                .rdp-caption {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 0.5rem 0;
                  position: relative;
                }
                .rdp-caption_label {
                  font-weight: 600;
                  font-size: 0.95rem;
                }
                .rdp-nav {
                  display: flex;
                  gap: 0.25rem;
                }
                .rdp-nav_button {
                  width: 32px;
                  height: 32px;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: background-color 0.2s;
                }
                .rdp-nav_button:hover {
                  background-color: hsl(var(--accent));
                }
                .rdp-head_cell {
                  color: hsl(var(--muted-foreground));
                  font-weight: 500;
                  font-size: 0.875rem;
                }
                .rdp-cell {
                  padding: 2px;
                }
                .rdp-day {
                  width: 40px;
                  height: 40px;
                  border-radius: 6px;
                  font-size: 0.875rem;
                  transition: all 0.2s;
                }
                .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
                  background-color: hsl(var(--accent));
                }
                .rdp-day_selected {
                  background-color: hsl(var(--primary)) !important;
                  color: hsl(var(--primary-foreground));
                  font-weight: 600;
                }
                .rdp-day_today:not(.rdp-day_selected) {
                  font-weight: 600;
                  color: hsl(var(--primary));
                }
                .rdp-day_disabled {
                  opacity: 0.3;
                  cursor: not-allowed;
                }
              `}</style>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: today }}
                showOutsideDays={false}
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Task will auto-migrate to Today on this date
            </p>
          </div>

          {/* Time Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeTime}
                onChange={(e) => setIncludeTime(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                Include specific time
              </span>
            </label>
          </div>

          {/* Time Picker (conditional) */}
          {includeTime && (
            <div>
              <label className="block text-sm font-medium mb-3">
                Time
              </label>
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/30">
                <Clock className="w-5 h-5 text-muted-foreground" />

                {/* Hour */}
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center font-medium"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, '0');
                    return <option key={h} value={h}>{h}</option>;
                  })}
                </select>

                <span className="text-xl font-bold text-muted-foreground">:</span>

                {/* Minute */}
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center font-medium"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* AM/PM */}
                <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      period === 'AM'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                      period === 'PM'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Selected time: {hour}:{minute} {period}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskText.trim() || !selectedDate}
              className={cn(
                "flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg transition-colors font-medium",
                !taskText.trim() || !selectedDate
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary/90"
              )}
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
              How Future Log works
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Tasks are organized by month in the Future Log</li>
              <li>• On the scheduled date, tasks automatically move to Today</li>
              <li>• Perfect for planning ahead without cluttering Today</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
