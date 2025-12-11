import { BulletItem, Bucket } from '@shared/schema';
import BulletCard from './BulletCard';
import Masonry from 'react-masonry-css';
import { ListX } from 'lucide-react';
import pixelFace from '@/assets/pixel-face.svg';

interface MasonryBucketViewProps {
  bucket: Bucket;
  items: BulletItem[];
  onToggleComplete: (id: string) => void;
  onCardClick: (id: string) => void;
  onArchive?: (id: string) => void;
  onStartFocus?: (id: string, text: string) => void;
  onMarkAsVIT?: (id: string) => void;
  activeId?: string | null;
}

const EMPTY_STATES: Record<Bucket, { title: string; description: string }> = {
  today: {
    title: "Your day awaits",
    description: "Press / to add tasks and events for today",
  },
  tomorrow: {
    title: "Planning ahead",
    description: "Add items for tomorrow to stay organized",
  },
  someday: {
    title: "Your idea backlog",
    description: "A safe space for future tasks and ideas",
  },
};

export default function MasonryBucketView({
  bucket,
  items,
  onToggleComplete,
  onCardClick,
  onArchive,
  onStartFocus,
  onMarkAsVIT,
  activeId,
}: MasonryBucketViewProps) {
  // Filter out archived items
  const activeItems = items.filter((i) => !i.archivedAt);

  const scheduledItems = activeItems
    .filter((i) => i.type === 'event' && i.time)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const generalItems = activeItems.filter((i) => !(i.type === 'event' && i.time));

  const breakpointColumns = {
    default: 3,
    1024: 2,
    768: 1,
  };

  // Empty state
  if (activeItems.length === 0) {
    const emptyState = EMPTY_STATES[bucket];
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {bucket === 'today' ? (
          <div className="w-16 h-16 flex items-center justify-center mb-4 animate-soft-bounce">
            <img src={pixelFace} alt="Pixel face" className="w-12 h-12" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
            <ListX className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">{emptyState.title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
        {/* Scheduled Section - Only for Today/Tomorrow buckets */}
        {scheduledItems.length > 0 && bucket !== 'someday' && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Scheduled
            </h3>
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {scheduledItems.map((item) => (
                <BulletCard
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onClick={onCardClick}
                  onArchive={onArchive}
                  onStartFocus={onStartFocus}
                  onMarkAsVIT={onMarkAsVIT}
                  isDragging={activeId === item.id}
                />
              ))}
            </Masonry>
          </div>
        )}

        {/* General Items Section */}
        {generalItems.length > 0 && (
          <div>
            {scheduledItems.length > 0 && bucket !== 'someday' && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                All Items
              </h3>
            )}
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {generalItems.map((item) => (
                <BulletCard
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onClick={onCardClick}
                  onArchive={onArchive}
                  onStartFocus={onStartFocus}
                  onMarkAsVIT={onMarkAsVIT}
                  isDragging={activeId === item.id}
                />
              ))}
            </Masonry>
          </div>
        )}
    </div>
  );
}
