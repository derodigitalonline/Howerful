import { useState } from 'react';
import { BulletItem } from '@shared/schema';
import { ChevronDown, ChevronRight, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import BulletCard from './BulletCard';
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns';

interface FutureLogViewProps {
  items: BulletItem[];
  onToggleComplete: (id: string) => void;
  onCardClick: (id: string) => void;
  onArchive?: (id: string) => void;
  onOpenAddSheet: () => void;
}

interface MonthSection {
  monthKey: string;
  monthLabel: string;
  items: BulletItem[];
  isPast: boolean;
}

export default function FutureLogView({
  items,
  onToggleComplete,
  onCardClick,
  onArchive,
  onOpenAddSheet,
}: FutureLogViewProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Filter out archived items
  const activeItems = items.filter((i) => !i.archivedAt);

  // Group items by month
  const monthSections: MonthSection[] = [];
  const monthMap = new Map<string, BulletItem[]>();
  const today = new Date();

  // Collect items by month
  activeItems.forEach((item) => {
    if (item.scheduledDate) {
      const date = parseISO(item.scheduledDate);
      const monthKey = format(startOfMonth(date), 'yyyy-MM');

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(item);
    }
  });

  // Convert map to sorted array of month sections
  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  sortedMonthKeys.forEach((monthKey) => {
    const date = parseISO(`${monthKey}-01`);
    const isPast = date < startOfMonth(today);

    monthSections.push({
      monthKey,
      monthLabel: format(date, 'MMMM yyyy'),
      items: monthMap.get(monthKey)!,
      isPast,
    });
  });

  // Add upcoming 6 months even if empty
  for (let i = 0; i < 6; i++) {
    const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthKey = format(futureDate, 'yyyy-MM');

    if (!monthMap.has(monthKey)) {
      monthSections.push({
        monthKey,
        monthLabel: format(futureDate, 'MMMM yyyy'),
        items: [],
        isPast: false,
      });
    }
  }

  // Sort all sections by month
  monthSections.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-[1250px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Future Log</h2>
            <p className="text-sm text-muted-foreground">
              Items auto-migrate to Today on their date
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAddSheet}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Month Sections */}
      <div className="space-y-2">
        {monthSections.map((section) => {
          const isExpanded = expandedMonths.has(section.monthKey);
          const hasItems = section.items.length > 0;

          return (
            <div
              key={section.monthKey}
              className={cn(
                "border rounded-lg overflow-hidden transition-all",
                section.isPast && "opacity-60"
              )}
            >
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(section.monthKey)}
                className={cn(
                  "w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors",
                  hasItems && "font-medium"
                )}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className={cn(section.isPast && "text-muted-foreground")}>
                    {section.monthLabel}
                  </span>
                </div>
                {hasItems && (
                  <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    {section.items.length}
                  </span>
                )}
              </button>

              {/* Month Content */}
              {isExpanded && (
                <div className="p-4 bg-muted/10 space-y-3">
                  {/* Items */}
                  {section.items.map((item) => (
                    <BulletCard
                      key={item.id}
                      item={item}
                      onToggleComplete={onToggleComplete}
                      onClick={onCardClick}
                      onArchive={onArchive}
                    />
                  ))}

                  {/* Empty State */}
                  {section.items.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No tasks scheduled for this month
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
