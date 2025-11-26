# Dojo Redesign Plan - Masonry Grid & Slash Command Input

## 🎯 Vision Summary

Transform the Dojo from a linear list-based bullet journal into a **fun, dynamic masonry grid** with slash command input, simplified item types, and hover-based quick actions.

### Key Changes:
1. **Slash Command Input** - "/" to activate, no autofocus
2. **Simplified Types** - Tasks by default, Events if time selected (no more notes)
3. **Masonry Grid Layout** - Max 320px cards in dynamic grid
4. **Hover Actions** - Floating "DONE" button on hover
5. **Click to Edit** - Click cards to edit text/time

---

## 📋 Phase 1: Input Redesign (Foundation)

**Goal**: Replace autofocus input with slash-command activated input with inline chips

### Tasks:

#### 1.1 Create New SlashInput Component
**File**: `client/src/components/SlashInput.tsx`

**Features**:
- Non-autofocus input field
- Global "/" keypress listener to focus
- Inline time selection chips (Morning 8AM, Afternoon 12PM, Evening 6PM, Choose)
- Custom time picker dialog
- Visual indicator when active
- "CANCEL" button to blur/reset

**Props**:
```typescript
interface SlashInputProps {
  onAddItem: (text: string, time?: string) => void;
  placeholder?: string;
}
```

**State**:
```typescript
const [text, setText] = useState('');
const [selectedTime, setSelectedTime] = useState<string | null>(null);
const [isActive, setIsActive] = useState(false);
const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
```

**Behavior**:
- When "/" pressed globally → focus input, set `isActive = true`
- When input focused → show time chips below
- When input blurred and empty → hide time chips, set `isActive = false`
- Enter key → call `onAddItem(text, selectedTime)`, reset state
- Escape → blur and reset
- CANCEL button → blur and reset

#### 1.2 Add Global Slash Listener
**File**: `client/src/pages/Dojo.tsx`

**Implementation**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if already typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### 1.3 Update Schema Logic
**File**: `shared/schema.ts`

**Changes**:
```typescript
// Remove 'note' from types
export const bulletItemTypes = ["task", "event"] as const;

// Update type determination logic
export function determineBulletType(text: string, time?: string): BulletItemType {
  // If time is provided, it's an event
  if (time) return 'event';

  // Otherwise, it's a task
  return 'task';
}
```

#### 1.4 Update addItem Handler
**File**: `client/src/hooks/useBulletJournal.tsx`

**Update**:
```typescript
const addItem = (
  text: string,
  bucket: BulletBucket = 'today',
  time?: string,
  date?: string
) => {
  const type = determineBulletType(text, time);

  const newItem: BulletItem = {
    id: crypto.randomUUID(),
    text,
    type,
    bucket,
    time,
    date,
    completed: false,
    createdAt: Date.now(),
    order: items.length,
  };

  // ... rest of mutation logic
};
```

### Deliverables:
- [ ] SlashInput component with time chips
- [ ] Global "/" listener in Dojo
- [ ] Schema updated to task/event only
- [ ] addItem handler respects time → event logic

### Testing:
- Press "/" from anywhere → input focuses
- Type task text → Enter → creates task
- Type text + select time → Enter → creates event
- CANCEL or Escape → clears input
- Clicking into input also shows chips

---

## 📋 Phase 2: Masonry Grid Layout

**Goal**: Replace linear list with dynamic masonry grid (max 320px cards)

### Tasks:

#### 2.1 Install Masonry Library
**Command**:
```bash
npm install react-masonry-css
```

#### 2.2 Create BulletCard Component
**File**: `client/src/components/BulletCard.tsx`

**Features**:
- Replaces current inline BulletItem for grid display
- Max width: 320px
- Dynamic height based on content
- Rounded corners, shadow on hover
- Shows task type indicator (checkbox for task, clock for event)
- Shows time badge if event
- Hover reveals floating "DONE" button

**Props**:
```typescript
interface BulletCardProps {
  item: BulletItem;
  onToggleComplete: (id: string) => void;
  onClick: (id: string) => void; // Click to edit
  isDragging?: boolean;
  dragHandleProps?: any;
}
```

**Structure**:
```tsx
<div className="bullet-card relative group">
  {/* Drag Handle - Top Left */}
  <div {...dragHandleProps} className="drag-handle">⋮⋮</div>

  {/* Type Indicator - Checkbox or Clock */}
  <div className="type-indicator">
    {item.type === 'task' ? <Checkbox /> : <Clock />}
  </div>

  {/* Text Content */}
  <div className="text-content" onClick={() => onClick(item.id)}>
    {item.text}
  </div>

  {/* Time Badge (if event) */}
  {item.time && (
    <div className="time-badge">{formatTime(item.time)}</div>
  )}

  {/* Floating DONE Button - Appears on Hover */}
  {item.type === 'task' && !item.completed && (
    <Button
      size="sm"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      onClick={(e) => {
        e.stopPropagation();
        onToggleComplete(item.id);
      }}
    >
      DONE
    </Button>
  )}
</div>
```

#### 2.3 Create MasonryBucketView Component
**File**: `client/src/components/MasonryBucketView.tsx`

**Features**:
- Uses react-masonry-css
- Responsive column count (2-3 columns depending on viewport)
- Groups scheduled items separately (with time headers)
- Empty state messages
- Drag & drop integration

**Implementation**:
```tsx
import Masonry from 'react-masonry-css';

export default function MasonryBucketView({
  bucket,
  items,
  onToggleComplete,
  onCardClick,
}: MasonryBucketViewProps) {
  const scheduledItems = items
    .filter(i => i.type === 'event' && i.time)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const generalItems = items.filter(i => !(i.type === 'event' && i.time));

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <div className="masonry-bucket">
      {/* Scheduled Section */}
      {scheduledItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Scheduled</h3>
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            {scheduledItems.map(item => (
              <BulletCard
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onClick={onCardClick}
              />
            ))}
          </Masonry>
        </div>
      )}

      {/* General Items Section */}
      {generalItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">All Items</h3>
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            {generalItems.map(item => (
              <BulletCard
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onClick={onCardClick}
              />
            ))}
          </Masonry>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <EmptyBucketState bucket={bucket} />
      )}
    </div>
  );
}
```

#### 2.4 Add Masonry Styles
**File**: `client/src/index.css` or component-specific CSS

```css
.masonry-grid {
  display: flex;
  margin-left: -16px; /* gutter size offset */
  width: auto;
}

.masonry-column {
  padding-left: 16px; /* gutter size */
  background-clip: padding-box;
}

.bullet-card {
  max-width: 320px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  cursor: pointer;
}

.bullet-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: grab;
  font-size: 12px;
  color: var(--muted-foreground);
}

.bullet-card:hover .drag-handle {
  opacity: 1;
}
```

#### 2.5 Update Dojo to Use Masonry
**File**: `client/src/pages/Dojo.tsx`

**Replace**:
```tsx
// OLD
<BucketView
  bucket="today"
  items={todayItems}
  onToggleCompletion={handleToggleCompletion}
/>

// NEW
<MasonryBucketView
  bucket="today"
  items={todayItems}
  onToggleComplete={handleToggleCompletion}
  onCardClick={handleCardClick}
/>
```

### Deliverables:
- [ ] BulletCard component with max 320px width
- [ ] MasonryBucketView with responsive columns
- [ ] Hover state shows DONE button
- [ ] Masonry CSS styles
- [ ] Dojo updated to use masonry layout

### Testing:
- Cards display in masonry grid
- Grid is responsive (1-3 columns)
- Hovering shows DONE button
- Clicking DONE marks complete + awards XP
- Cards have max 320px width
- Scheduled items separated from general items

---

## 📋 Phase 3: Click-to-Edit Modal

**Goal**: Clicking a card opens an edit modal/dialog

### Tasks:

#### 3.1 Create EditBulletDialog Component
**File**: `client/src/components/EditBulletDialog.tsx`

**Features**:
- Modal dialog using shadcn Dialog
- Text input (autofocus)
- Time picker (if event, or to convert task → event)
- Type toggle (Task ↔ Event)
- Delete button
- Save/Cancel actions

**Props**:
```typescript
interface EditBulletDialogProps {
  item: BulletItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<BulletItem>) => void;
  onDelete: (id: string) => void;
}
```

**Structure**:
```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Item</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* Text Input */}
      <Textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        placeholder="Task or event text..."
        autoFocus
      />

      {/* Type Toggle */}
      <div className="flex gap-2">
        <Button
          variant={editType === 'task' ? 'default' : 'outline'}
          onClick={() => setEditType('task')}
        >
          Task
        </Button>
        <Button
          variant={editType === 'event' ? 'default' : 'outline'}
          onClick={() => setEditType('event')}
        >
          Event
        </Button>
      </div>

      {/* Time Picker (if event) */}
      {editType === 'event' && (
        <div>
          <Label>Time</Label>
          <Input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
          />
        </div>
      )}
    </div>

    <DialogFooter className="flex justify-between">
      <Button
        variant="destructive"
        onClick={() => onDelete(item.id)}
      >
        Delete
      </Button>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 3.2 Add Edit State to Dojo
**File**: `client/src/pages/Dojo.tsx`

```typescript
const [editingItem, setEditingItem] = useState<BulletItem | null>(null);
const [editDialogOpen, setEditDialogOpen] = useState(false);

const handleCardClick = (id: string) => {
  const item = items.find(i => i.id === id);
  if (item) {
    setEditingItem(item);
    setEditDialogOpen(true);
  }
};

const handleSaveEdit = (id: string, updates: Partial<BulletItem>) => {
  updateItem(id, updates);
  setEditDialogOpen(false);
  setEditingItem(null);
};

const handleDeleteFromEdit = (id: string) => {
  deleteItem(id);
  setEditDialogOpen(false);
  setEditingItem(null);
};
```

#### 3.3 Wire Up Click Handlers
**Pass to MasonryBucketView**:
```tsx
<MasonryBucketView
  bucket="today"
  items={todayItems}
  onToggleComplete={handleToggleCompletion}
  onCardClick={handleCardClick}  // NEW
/>
```

### Deliverables:
- [ ] EditBulletDialog component
- [ ] Dialog opens on card click
- [ ] Can edit text, time, and type
- [ ] Can delete from dialog
- [ ] Save/Cancel buttons work

### Testing:
- Click card → dialog opens
- Edit text → Save → updates card
- Toggle type task ↔ event → updates
- Add/remove time → updates
- Delete → removes card
- Cancel → no changes

---

## 📋 Phase 4: Drag & Drop for Masonry

**Goal**: Integrate drag & drop reordering within masonry grid

### Tasks:

#### 4.1 Research Masonry + DnD Integration
**Challenge**: `@dnd-kit` works with vertical lists, masonry is multi-column

**Options**:
1. **Custom drag overlay** - Use `DndContext` with custom collision detection
2. **Single column per bucket** - Simplify to 1 column for sortable, expand to masonry for display only
3. **Hybrid approach** - Drag within columns, not across

**Recommended**: Option 1 - Custom drag overlay with `closestCenter` collision

#### 4.2 Implement DnD in MasonryBucketView
**File**: `client/src/components/MasonryBucketView.tsx`

**Changes**:
```tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

// Wrap Masonry with DndContext
<DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={generalItems.map(i => i.id)}>
    <Masonry ... >
      {generalItems.map(item => (
        <SortableBulletCard key={item.id} item={item} ... />
      ))}
    </Masonry>
  </SortableContext>
</DndContext>
```

#### 4.3 Create SortableBulletCard Wrapper
**Wrap BulletCard with useSortable**:
```tsx
function SortableBulletCard({ item, ...props }: BulletCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BulletCard
        item={item}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        {...props}
      />
    </div>
  );
}
```

#### 4.4 Handle Drag End
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = generalItems.findIndex(i => i.id === active.id);
  const newIndex = generalItems.findIndex(i => i.id === over.id);

  const newOrder = arrayMove(generalItems, oldIndex, newIndex);

  // Call reorder mutation
  onReorder(bucket, newOrder.map(i => i.id));
};
```

### Deliverables:
- [ ] DndContext wraps masonry grid
- [ ] Cards are draggable by handle
- [ ] Drag end reorders items
- [ ] Visual feedback during drag

### Testing:
- Drag card by handle
- Drop on another card → reorders
- Order persists after refresh

---

## 📋 Phase 5: Polish & Edge Cases

**Goal**: Handle edge cases, animations, and UX polish

### Tasks:

#### 5.1 Handle Empty States
- Empty bucket shows helpful message + illustration
- First-time user onboarding tooltip on "/"

#### 5.2 Animations
- Card entrance animation (fade + slide up)
- Masonry shuffle animation on reorder
- Completion animation (strikethrough + fade out)

#### 5.3 Keyboard Shortcuts
- Ensure "/" works from anywhere
- Escape to close edit dialog
- Enter to save in edit dialog

#### 5.4 Mobile Responsiveness
- Masonry collapses to 1 column on mobile
- Touch-friendly card sizes
- Swipe actions for quick complete?

#### 5.5 Accessibility
- Proper ARIA labels
- Keyboard navigation in edit dialog
- Focus management

#### 5.6 Edge Cases
**What if user types "/" inside the slash input?**
- Ignore global listener if already focused

**What if user adds 50+ items to a bucket?**
- Masonry handles well, but consider virtualization if performance degrades

**What if text is very long?**
- Card grows vertically (no max-height)
- Consider "Read more" toggle if > 300 chars

**What if user deletes time from event?**
- Converts back to task automatically

**What if user wants to add a time to an existing task?**
- Click to edit → toggle to event → add time

**What if user drags a scheduled event to general section?**
- Allow, but keep time metadata (still shows in scheduled)

#### 5.7 Migration Strategy
**Existing notes → tasks**:
```typescript
// One-time migration
useEffect(() => {
  const migrateNotes = async () => {
    const noteItems = items.filter(i => i.type === 'note');

    for (const note of noteItems) {
      await updateItem(note.id, { type: 'task' });
    }
  };

  migrateNotes();
}, []);
```

### Deliverables:
- [ ] Empty states
- [ ] Smooth animations
- [ ] Keyboard shortcuts working
- [ ] Mobile responsive
- [ ] Accessible
- [ ] Edge cases handled
- [ ] Existing notes migrated to tasks

### Testing:
- Test on mobile devices
- Test with screen reader
- Test with 50+ items
- Test very long text
- Test all keyboard shortcuts

---

## 🎨 Design Suggestions & Enhancements

### 1. **Color-Coded Cards**
- Tasks: Neutral (current card color)
- Events with time: Subtle blue tint
- Completed tasks: Muted green tint

### 2. **Quick Add Shortcuts**
Inside SlashInput, detect patterns:
- "tomorrow: text" → adds to Tomorrow bucket
- "someday: text" → adds to Someday bucket
- "8am text" → creates event with 8am time

### 3. **Drag to Buckets**
Allow dragging cards between Today/Tomorrow/Someday sections

### 4. **Batch Operations**
Multi-select cards (Shift + click) for batch:
- Mark all done
- Move to bucket
- Delete

### 5. **Card Metadata Footer**
Show creation time, last edited, focus pomodoros completed

### 6. **Celebration Animations**
When completing tasks:
- Confetti on level up
- Coin flip animation
- XP number floats up

---

## 🚧 Potential Issues & Solutions

### Issue 1: Masonry Reflow on Completion
**Problem**: When card is marked done and removed, masonry shifts abruptly

**Solution**:
- Keep completed cards in grid but with muted style
- Add "Hide completed" toggle
- Use CSS transitions for smooth reflow

### Issue 2: Drag & Drop Feels Awkward in Masonry
**Problem**: Multi-column layout makes dragging confusing

**Solution**:
- Only allow drag within same section (scheduled vs general)
- Show drop zones/highlights
- Consider reverting to single column for Today bucket

### Issue 3: Time Chips Take Too Much Space
**Problem**: Inline chips make input area cluttered

**Solution**:
- Show chips only when input is focused and has text
- Use compact chip design
- Stack horizontally with scroll

### Issue 4: Mobile UX for Slash Command
**Problem**: Mobile keyboards don't have "/" easily accessible

**Solution**:
- Add visible "+" button on mobile
- "+" button also triggers input focus
- Keep "/" as alternative for power users

### Issue 5: Performance with Many Cards
**Problem**: 100+ cards in masonry might lag

**Solution**:
- Implement virtualization (react-virtuoso with masonry)
- Paginate or infinite scroll
- Archive old completed tasks

---

## ✅ Success Metrics

After implementation, measure:
- **Engagement**: Are users adding more items per session?
- **Completion Rate**: Are more tasks being marked done?
- **XP Gain**: Is XP per session increasing?
- **Fun Factor**: Qualitative feedback on "fun" experience
- **Mobile Usage**: Adoption on mobile devices

---

## 🔄 Rollback Plan

If redesign doesn't work:
1. Keep both layouts as a toggle setting
2. A/B test with user preference
3. Collect feedback before deprecating old layout

**Feature Flag**:
```typescript
const useMasonryLayout = profile.preferences?.masonryLayout ?? true;

{useMasonryLayout ? (
  <MasonryBucketView ... />
) : (
  <BucketView ... />
)}
```

---

## 📅 Estimated Timeline

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| Phase 1: Input Redesign | 3-4 hours | HIGH |
| Phase 2: Masonry Grid | 4-5 hours | HIGH |
| Phase 3: Edit Modal | 2-3 hours | MEDIUM |
| Phase 4: Drag & Drop | 3-4 hours | MEDIUM |
| Phase 5: Polish | 4-6 hours | LOW |

**Total**: ~16-22 hours

---

## 🚀 Quick Start (Phase 1 Only)

To get started immediately with the slash input:

1. Create `SlashInput.tsx` component
2. Add global "/" listener to Dojo
3. Update `addItem` to accept `time` parameter
4. Update schema to remove "note" type
5. Test slash command workflow

This gives immediate UX improvement without touching the grid layout.

---

## 💡 Additional Ideas for Future

- **Templates**: "Meeting notes", "Grocery list", etc.
- **Tags/Labels**: #work, #personal, @home
- **Recurring Tasks**: Daily/weekly repeating items
- **Subtasks**: Nested checklist within cards
- **Attachments**: Link files or images to cards
- **Collaboration**: Share buckets with others
- **Voice Input**: Dictate tasks via speech-to-text

---

## 📝 Notes & Decisions

### Why remove "notes"?
- Simplifies mental model (task vs event)
- Notes are just uncompleted tasks that never get done
- Reduces cognitive load
- Time-based distinction is clearer

### Why masonry over list?
- More visual variety = more engaging
- Better use of space with varied content lengths
- Feels more playful and less rigid
- Differentiates from traditional todo apps

### Why slash command?
- Feels like Notion/Slack - familiar to power users
- No accidental typing from autofocus
- Clear intent to add item
- Leaves space for other UI elements

### Why max 320px cards?
- Optimal reading width for task text
- Allows 2-3 columns on desktop
- Mobile-friendly when single column
- Matches modern card-based UIs (Trello, Pinterest)

---

Let me know which phase you'd like to tackle first! 🚀
